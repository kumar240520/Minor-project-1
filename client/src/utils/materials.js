import { createAuthenticatedSupabaseClient, supabase } from '../supabaseClient';
import { getDisplayName } from './auth';
import { createRewardTransaction, createPurchaseTransaction } from './transactions';

export const MATERIALS_BUCKET =
  import.meta.env.VITE_SUPABASE_MATERIALS_BUCKET || 'Storage';

const APPROVAL_REWARDS = {
  material: 1,
  pyq: 1,
};

const IMAGE_FILE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'bmp',
  'svg',
  'avif',
]);

const PDF_FILE_EXTENSIONS = new Set(['pdf']);

const getTrimmedString = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const getFileExtension = (fileName = '') => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
};

const slugify = (value, fallback = 'file') => {
  const slug = getTrimmedString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || fallback;
};

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value || '');

const OPTIONAL_MATERIAL_COLUMNS = new Set([
  'uploaded_by',
  'type',
  'category',
  'material_type',
  'approved_by',
  'approved_at',
  'uploader_name',
  'file_name',
  'file_type',
  'downloads',
  'views',
  'icon_type',
  'bg_color',
  'text_color',
  'storage_bucket',
]);

const withBucketSetupGuidance = (error, bucketName = MATERIALS_BUCKET) => {
  const message = error?.message || '';

  if (/bucket.*not found/i.test(message)) {
    return new Error(
      `Storage bucket "${bucketName}" was not found. Create it in Supabase Storage or run server/models/supabase-material-upload.sql first.`,
    );
  }

  return error;
};

const getMissingSchemaColumn = (error, tableName = 'materials') => {
  const message = error?.message || '';
  const patterns = [
    new RegExp(`Could not find the ['"]([^'"]+)['"] column of ['"]${tableName}['"] in the schema cache`, 'i'),
    new RegExp(`column ['"]([^'"]+)['"] of relation ['"]${tableName}['"] does not exist`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
};

const omitKey = (value, keyToRemove) => {
  const nextValue = { ...value };
  delete nextValue[keyToRemove];
  return nextValue;
};

const getAuthenticatedDataClient = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.access_token || !session?.user?.id) {
    throw new Error('Your login session has expired. Please sign in again and retry the upload.');
  }

  return {
    session,
    client: createAuthenticatedSupabaseClient(session.access_token),
  };
};

const withUploadPolicyGuidance = (error, context, bucketName = MATERIALS_BUCKET) => {
  const message = error?.message || '';

  if (/row-level security policy/i.test(message)) {
    if (context === 'storage') {
      return new Error(
        `Upload was blocked by Supabase Storage permissions for bucket "${bucketName}". Re-run server/models/supabase-material-upload.sql and make sure the storage policy bucket ID matches your real bucket.`,
      );
    }

    if (context === 'materials') {
      return new Error(
        'Saving the material record was blocked by the materials table RLS policy. Make sure you are logged in, your public.users row exists, and server/models/supabase-material-upload.sql has been applied after server/models/supabase-role-rls.sql.',
      );
    }
  }

  return error;
};

const insertMaterialWithCompatibility = async (client, payload) => {
  let nextPayload = { ...payload };
  const removedColumns = new Set();

  while (true) {
    const { data, error } = await client.from('materials').insert([nextPayload]).select().single();

    if (!error) {
      return data;
    }

    const missingColumn = getMissingSchemaColumn(error, 'materials');

    if (
      !missingColumn ||
      !OPTIONAL_MATERIAL_COLUMNS.has(missingColumn) ||
      removedColumns.has(missingColumn)
    ) {
      throw error;
    }

    removedColumns.add(missingColumn);
    nextPayload = omitKey(nextPayload, missingColumn);
  }
};

const updateMaterialWithCompatibility = async (buildQuery, payload) => {
  let nextPayload = { ...payload };
  const removedColumns = new Set();

  while (true) {
    const { error } = await buildQuery(nextPayload);

    if (!error) {
      return;
    }

    const missingColumn = getMissingSchemaColumn(error, 'materials');

    if (
      !missingColumn ||
      !OPTIONAL_MATERIAL_COLUMNS.has(missingColumn) ||
      removedColumns.has(missingColumn)
    ) {
      throw error;
    }

    removedColumns.add(missingColumn);
    nextPayload = omitKey(nextPayload, missingColumn);
  }
};

export const getMaterialType = (value) => {
  if (typeof value === 'object' && value !== null) {
    return getMaterialType(value.type || value.material_type || value.category);
  }

  const normalizedValue = getTrimmedString(value).toLowerCase();

  if (normalizedValue === 'pyq') {
    return 'pyq';
  }

  return 'material';
};

export const getMaterialApprovalReward = (material) =>
  APPROVAL_REWARDS[getMaterialType(material)] || APPROVAL_REWARDS.material;

export const getMaterialStatus = (material) =>
  getTrimmedString(material?.status).toLowerCase() || 'pending';

export const isMaterialApproved = (material) => getMaterialStatus(material) === 'approved';

export const getMaterialStatusLabel = (material) => {
  const status = getMaterialStatus(material);

  if (status === 'approved') {
    return 'Approved';
  }

  if (status === 'rejected') {
    return 'Rejected';
  }

  return 'Pending Review';
};

export const getMaterialFileExtension = (material) => {
  const fileName = getTrimmedString(material?.file_name);
  const storedFileReference = getTrimmedString(material?.file_url);
  const fileType = getTrimmedString(material?.file_type);

  if (fileName) {
    return getFileExtension(fileName);
  }

  if (fileType) {
    return fileType.replace(/^\./, '').toLowerCase();
  }

  if (!storedFileReference) {
    return '';
  }

  const normalizedReference = storedFileReference.split('?')[0];
  return getFileExtension(normalizedReference);
};

export const getMaterialPreviewKind = (material) => {
  const extension = getMaterialFileExtension(material);

  if (PDF_FILE_EXTENSIONS.has(extension)) {
    return 'pdf';
  }

  if (IMAGE_FILE_EXTENSIONS.has(extension)) {
    return 'image';
  }

  return 'unsupported';
};

export const canPreviewMaterial = (material, { viewerRole = 'student' } = {}) =>
  viewerRole === 'admin' || isMaterialApproved(material);

const assertMaterialPreviewAccess = (material, options) => {
  if (!canPreviewMaterial(material, options)) {
    throw new Error('Only approved files are visible to students.');
  }
};

const getCategoryPresentation = (category, type) => {
  if (type === 'pyq') {
    return {
      displayCategory: 'PYQ',
      legacyMaterialType: 'PYQ',
      iconType: 'FileText',
      bgColor: 'bg-violet-100',
      textColor: 'text-violet-600',
    };
  }

  const normalizedCategory = getTrimmedString(category) || 'Notes';

  if (normalizedCategory.startsWith('Placement_')) {
    const placementCategory = normalizedCategory.replace('Placement_', '');

    if (placementCategory === 'Interview') {
      return {
        displayCategory: placementCategory,
        legacyMaterialType: 'Placement',
        iconType: 'Briefcase',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-600',
      };
    }

    if (placementCategory === 'Core') {
      return {
        displayCategory: placementCategory,
        legacyMaterialType: 'Placement',
        iconType: 'PlayCircle',
        bgColor: 'bg-rose-100',
        textColor: 'text-rose-600',
      };
    }

    if (placementCategory === 'Aptitude') {
      return {
        displayCategory: placementCategory,
        legacyMaterialType: 'Placement',
        iconType: 'BookOpen',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-600',
      };
    }

    return {
      displayCategory: placementCategory,
      legacyMaterialType: 'Placement',
      iconType: 'BookOpen',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    };
  }

  if (normalizedCategory === 'Assignment') {
    return {
      displayCategory: normalizedCategory,
      legacyMaterialType: 'Material',
      iconType: 'BookOpen',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
    };
  }

  return {
    displayCategory: normalizedCategory,
    legacyMaterialType: 'Material',
    iconType: 'BookOpen',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  };
};

const buildStoragePath = ({ userId, type, fileName }) => {
  const extension = getFileExtension(fileName);
  const nameWithoutExtension = extension
    ? fileName.slice(0, -(extension.length + 1))
    : fileName;
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
  const safeFileName = slugify(nameWithoutExtension, 'upload');

  return `${userId}/${type}/${timestamp}-${safeFileName}${extension ? `.${extension}` : ''}`;
};

export const uploadMaterialFile = async ({ file, userId, type }) => {
  const { client } = await getAuthenticatedDataClient();
  const filePath = buildStoragePath({
    userId,
    type,
    fileName: file?.name || 'upload',
  });

  const { error } = await client.storage.from(MATERIALS_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file?.type || undefined,
  });

  if (error) {
    throw withUploadPolicyGuidance(
      withBucketSetupGuidance(error, MATERIALS_BUCKET),
      'storage',
      MATERIALS_BUCKET,
    );
  }

  return filePath;
};

export const removeStoredMaterialFile = async (filePath, bucketName = MATERIALS_BUCKET) => {
  if (!filePath || isAbsoluteUrl(filePath)) {
    return;
  }

  const { client } = await getAuthenticatedDataClient();
  const { error } = await client.storage.from(bucketName).remove([filePath]);

  if (error) {
    throw withBucketSetupGuidance(error, bucketName);
  }
};

export const createMaterialUpload = async ({
  title,
  description,
  subject,
  category,
  year,
  file,
  user,
}) => {
  const { session, client } = await getAuthenticatedDataClient();
  const activeUserId = session.user.id;
  const type = getMaterialType(category);
  const filePath = await uploadMaterialFile({
    file,
    userId: activeUserId,
    type,
  });
  const {
    displayCategory,
    legacyMaterialType,
    iconType,
    bgColor,
    textColor,
  } = getCategoryPresentation(category, type);
  const createdAt = new Date().toISOString();
  const payload = {
    title: getTrimmedString(title),
    description: getTrimmedString(description),
    subject: getTrimmedString(subject),
    year: year || null,
    file_url: filePath,
    uploaded_by: activeUserId,
    user_id: activeUserId,
    type,
    category: displayCategory,
    material_type: legacyMaterialType,
    status: 'pending',
    created_at: createdAt,
    approved_by: null,
    approved_at: null,
    uploader_name: getDisplayName(user, 'Anonymous Student'),
    file_name: file.name,
    file_type: getFileExtension(file.name).toUpperCase() || 'FILE',
    downloads: 0,
    views: 0,
    icon_type: iconType,
    bg_color: bgColor,
    text_color: textColor,
    storage_bucket: MATERIALS_BUCKET,
  };

  try {
    return await insertMaterialWithCompatibility(client, payload);
  } catch (error) {
    try {
      await removeStoredMaterialFile(filePath);
    } catch (cleanupError) {
      console.error('Failed to clean up storage after material insert failure:', cleanupError);
    }

    throw withUploadPolicyGuidance(error, 'materials');
  }
};

export const fetchApprovedMaterials = async (type) => {
  const baseQuery = () =>
    supabase
      .from('materials')
      .select('*')
      .eq('status', 'approved')
      .eq('type', type)
      .order('created_at', { ascending: false });

  let response = await baseQuery();

  if (getMissingSchemaColumn(response.error, 'materials') === 'type') {
    response = await supabase
      .from('materials')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
  }

  const { data, error } = response;

  if (error) {
    throw error;
  }

  return (data || []).filter((material) => getMaterialType(material) === type);
};

export const fetchApprovedStudyMaterials = async () => fetchApprovedMaterials('material');

export const fetchApprovedPyqs = async () => fetchApprovedMaterials('pyq');

export const fetchPendingMaterials = async ({ type } = {}) => {
  const baseQuery = () =>
    supabase
      .from('materials')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

  let response = type ? await baseQuery().eq('type', type) : await baseQuery();

  if (type && getMissingSchemaColumn(response.error, 'materials') === 'type') {
    response = await baseQuery();
  }

  const { data, error } = response;

  if (error) {
    throw error;
  }

  const materials = data || [];
  return type ? materials.filter((material) => getMaterialType(material) === type) : materials;
};

export const fetchStudentMaterials = async (userId) => {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .or(`uploaded_by.eq.${userId},user_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};

export const getMaterialAccessUrl = async (material, { viewerRole = 'student' } = {}) => {
  assertMaterialPreviewAccess(material, { viewerRole });
  const fileReference = getTrimmedString(material?.file_url);

  if (!fileReference) {
    throw new Error('No file was attached to this material.');
  }

  if (isAbsoluteUrl(fileReference)) {
    return fileReference;
  }

  const bucketName = material?.storage_bucket || MATERIALS_BUCKET;
  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileReference);

  if (!data?.publicUrl) {
    throw withBucketSetupGuidance(
      new Error(`Unable to create a public URL for "${fileReference}".`),
      bucketName,
    );
  }

  return data.publicUrl;
};

const openMaterialUrl = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

const downloadMaterialUrl = async (url, fileName = 'download') => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('The file could not be downloaded right now.');
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};

const bumpMaterialMetric = async (material, fieldName) => {
  if (!material?.id) {
    return;
  }

  const nextValue = Number(material?.[fieldName] || 0) + 1;
  const { error } = await supabase
    .from('materials')
    .update({ [fieldName]: nextValue })
    .eq('id', material.id);

  if (error) {
    throw error;
  }
};

export const getMaterialPreviewData = async (material, { viewerRole = 'student' } = {}) => {
  const publicUrl = await getMaterialAccessUrl(material, { viewerRole });
  const previewKind = getMaterialPreviewKind(material);

  try {
    await bumpMaterialMetric(material, 'views');
  } catch (error) {
    console.error('Failed to update material preview count:', error);
  }

  return {
    url: publicUrl,
    previewKind,
    isPreviewSupported: previewKind !== 'unsupported',
  };
};

export const previewMaterialFile = async (material, { viewerRole = 'student' } = {}) => {
  const publicUrl = await getMaterialAccessUrl(material, { viewerRole });

  try {
    await bumpMaterialMetric(material, 'views');
  } catch (error) {
    console.error('Failed to update material preview count:', error);
  }

  openMaterialUrl(publicUrl);
  return publicUrl;
};

export const downloadMaterialFile = async (material, { viewerRole = 'student' } = {}) => {
  console.log('[downloadMaterialFile] START - material:', material.id, material.title);
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Please login to download materials');
  }
  
  console.log('[downloadMaterialFile] User:', user.id);

  // Prevent self-download
  const uploaderId = material?.uploaded_by || material?.user_id;
  console.log('[downloadMaterialFile] Uploader:', uploaderId, 'User:', user.id);
  
  if (uploaderId === user.id) {
    console.log('[downloadMaterialFile] SELF-DOWNLOAD path - no coins deducted');
    // Allow download without coin deduction for own materials
    const publicUrl = await getMaterialAccessUrl(material, { viewerRole });
    
    try {
      await bumpMaterialMetric(material, 'downloads');
    } catch (error) {
      console.error('Failed to update download count:', error);
    }

    await downloadMaterialUrl(
      publicUrl,
      material?.file_name || material?.title || `material-${material?.id || 'download'}`,
    );

    return publicUrl;
  }

  // Check if already purchased
  console.log('[downloadMaterialFile] Checking if already purchased...');
  const { data: existingPurchase } = await supabase
    .from('resource_purchases')
    .select('*')
    .eq('user_id', user.id)
    .eq('resource_id', material.id)
    .single();

  console.log('[downloadMaterialFile] Existing purchase:', existingPurchase);

  if (existingPurchase) {
    console.log('[downloadMaterialFile] ALREADY PURCHASED path - no coins deducted');
    // Already purchased, allow download without deducting coins again
    const publicUrl = await getMaterialAccessUrl(material, { viewerRole });
    
    try {
      await bumpMaterialMetric(material, 'downloads');
    } catch (error) {
      console.error('Failed to update download count:', error);
    }

    await downloadMaterialUrl(
      publicUrl,
      material?.file_name || material?.title || `material-${material?.id || 'download'}`,
    );

    return publicUrl;
  }

  console.log('[downloadMaterialFile] NEW PURCHASE path - deducting coins');

  // Get material price (default to 5 if not set)
  const price = material?.price || 5;
  console.log('[downloadMaterialFile] Price:', price);

  // Check user has enough coins
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('coins')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    throw new Error('Could not verify your coin balance');
  }

  console.log('[downloadMaterialFile] User coins:', userData.coins);

  if (userData.coins < price) {
    throw new Error(`Insufficient coins. You have ${userData.coins} coins, but this material costs ${price} coins.`);
  }

  // Process download with coin deduction
  const publicUrl = await getMaterialAccessUrl(material, { viewerRole });

  try {
    console.log('[downloadMaterialFile] Processing coin deduction and transactions...');
    
    // 1. Deduct coins from buyer
    console.log('[downloadMaterialFile] Step 1: Deducting coins from buyer');
    const { error: deductError } = await supabase
      .from('users')
      .update({ coins: userData.coins - price })
      .eq('id', user.id);

    if (deductError) throw deductError;
    console.log('[downloadMaterialFile] Coins deducted successfully');

    // 2. Give 80% to uploader
    console.log('[downloadMaterialFile] Step 2: Giving reward to uploader');
    const uploaderReward = Math.floor(price * 0.8);
    if (uploaderReward > 0 && uploaderId) {
      const { data: uploaderData } = await supabase
        .from('users')
        .select('coins')
        .eq('id', uploaderId)
        .single();

      if (uploaderData) {
        await supabase
          .from('users')
          .update({ coins: uploaderData.coins + uploaderReward })
          .eq('id', uploaderId);
        console.log('[downloadMaterialFile] Uploader reward given:', uploaderReward);
      }
    }

    // 3. Record purchase
    console.log('[downloadMaterialFile] Step 3: Recording purchase');
    await supabase
      .from('resource_purchases')
      .insert({
        user_id: user.id,
        resource_id: material.id
      });

    // 4. Update download count
    console.log('[downloadMaterialFile] Step 4: Updating download count');
    await bumpMaterialMetric(material, 'downloads');

    // 5. Create transaction records
    console.log('[downloadMaterialFile] Step 5: Creating transaction records');
    try {
      console.log('[downloadMaterialFile] Creating purchase transaction for user:', user.id, 'amount:', price);
      await createPurchaseTransaction({
        userId: user.id,
        amount: price,
        source: 'resource_purchase',
        referenceId: material.id,
        description: `Purchased: ${material.title || 'Material'}`,
      });
      console.log('[downloadMaterialFile] ✅ Purchase transaction created successfully');
    } catch (txError) {
      console.error('[downloadMaterialFile] ❌ Failed to create purchase transaction:', txError);
      console.error('[downloadMaterialFile] Error code:', txError?.code);
      console.error('[downloadMaterialFile] Error message:', txError?.message);
      console.error('[downloadMaterialFile] Error details:', txError?.details);
    }

    if (uploaderReward > 0 && uploaderId) {
      try {
        console.log('[downloadMaterialFile] Creating sale transaction for uploader:', uploaderId, 'amount:', uploaderReward);
        await createRewardTransaction({
          userId: uploaderId,
          amount: uploaderReward,
          source: 'resource_sale',
          referenceId: material.id,
          description: `Sale: ${material.title || 'Material'}`,
        });
        console.log('[downloadMaterialFile] ✅ Sale transaction created successfully');
      } catch (txError) {
        console.error('[downloadMaterialFile] ❌ Failed to create sale transaction:', txError);
      }
    }

  } catch (error) {
    console.error('[downloadMaterialFile] Error processing download:', error);
    throw new Error('Failed to process download. Please try again.');
  }

  // Download the file
  console.log('[downloadMaterialFile] Downloading file...');
  try {
    await downloadMaterialUrl(
      publicUrl,
      material?.file_name || material?.title || `material-${material?.id || 'download'}`,
    );
  } catch (error) {
    console.error('Failed to trigger browser download, falling back to opening the file:', error);
    openMaterialUrl(publicUrl);
  }

  console.log('[downloadMaterialFile] COMPLETE');
  return publicUrl;
};

export const rejectMaterialUpload = async (materialId) => {
  const { error } = await supabase
    .from('materials')
    .update({ status: 'rejected' })
    .eq('id', materialId)
    .eq('status', 'pending');

  if (error) {
    throw error;
  }
};

export const approveMaterialUpload = async ({ material, adminUserId }) => {
  const rewardAmount = getMaterialApprovalReward(material);
  const uploaderId = material?.uploaded_by || material?.user_id;
  const approvedAt = new Date().toISOString();
  
  // Update material status to approved
  // This will trigger the SQL function to add coins and create transaction
  await updateMaterialWithCompatibility(
    (nextPayload) =>
      supabase
        .from('materials')
        .update(nextPayload)
        .eq('id', material.id)
        .eq('status', 'pending'),
    {
      status: 'approved',
      approved_by: adminUserId,
      approved_at: approvedAt,
    },
  );

  if (!uploaderId) {
    return { rewardAmount: 0 };
  }

  // Note: Coins are added and transaction is created by SQL trigger
  // Do NOT manually update coins or create transactions here
  // The trigger handles:
  // - Adding 1 coin to user balance
  // - Creating transaction with reference_type: 'MATERIAL_APPROVAL' or 'PYQ_APPROVAL'

  return { rewardAmount };
};

export const deleteMaterialUpload = async (material) => {
  const { error } = await supabase.from('materials').delete().eq('id', material.id);

  if (error) {
    throw error;
  }

  try {
    await removeStoredMaterialFile(material.file_url, material.storage_bucket || MATERIALS_BUCKET);
  } catch (cleanupError) {
    console.error('Failed to remove storage asset for deleted material:', cleanupError);
  }
};
