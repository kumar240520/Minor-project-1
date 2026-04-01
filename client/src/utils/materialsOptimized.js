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
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'avif',
]);

const PDF_FILE_EXTENSIONS = new Set(['pdf']);

// ==========================================
// OPTIMIZATION: Specific field selections instead of select('*')
// ==========================================

const MATERIAL_LIST_FIELDS = [
  'id', 'title', 'description', 'subject', 'year', 'category',
  'type', 'status', 'file_url', 'file_name', 'file_type',
  'uploaded_by', 'uploader_name', 'downloads', 'views',
  'created_at', 'approved_at', 'icon_type', 'bg_color', 'text_color',
  'price', 'storage_bucket'
].join(',');

const MATERIAL_DETAIL_FIELDS = [
  'id', 'title', 'description', 'subject', 'year', 'category',
  'type', 'status', 'file_url', 'file_name', 'file_type',
  'uploaded_by', 'user_id', 'uploader_name', 'downloads', 'views',
  'created_at', 'approved_by', 'approved_at', 
  'icon_type', 'bg_color', 'text_color', 'price', 'storage_bucket'
].join(',');

const MATERIAL_ADMIN_FIELDS = [
  'id', 'title', 'description', 'subject', 'category', 'type', 
  'status', 'file_url', 'file_name', 'uploaded_by', 'user_id',
  'uploader_name', 'downloads', 'views', 'created_at', 
  'approved_by', 'approved_at', 'price'
].join(',');

const getTrimmedString = (value) => {
  if (typeof value !== 'string') return '';
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
  'uploaded_by', 'type', 'category', 'material_type', 'approved_by',
  'approved_at', 'uploader_name', 'file_name', 'file_type', 
  'downloads', 'views', 'icon_type', 'bg_color', 'text_color', 'storage_bucket',
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
    if (match?.[1]) return match[1];
  }
  return null;
};

const omitKey = (value, keyToRemove) => {
  const nextValue = { ...value };
  delete nextValue[keyToRemove];
  return nextValue;
};

const getAuthenticatedDataClient = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session?.access_token || !session?.user?.id) {
    throw new Error('Your login session has expired. Please sign in again and retry the upload.');
  }
  return { session, client: createAuthenticatedSupabaseClient(session.access_token) };
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

// ==========================================
// OPTIMIZED: Insert with returning minimal data
// ==========================================

const insertMaterialWithCompatibility = async (client, payload) => {
  let nextPayload = { ...payload };
  const removedColumns = new Set();

  while (true) {
    // OPTIMIZATION: Use returning: 'minimal' to avoid fetching full row
    const { data, error } = await client
      .from('materials')
      .insert([nextPayload])
      .select('id, title, status, created_at') // OPTIMIZATION: Return only essential fields
      .single();

    if (!error) return data;

    const missingColumn = getMissingSchemaColumn(error, 'materials');
    if (!missingColumn || !OPTIONAL_MATERIAL_COLUMNS.has(missingColumn) || removedColumns.has(missingColumn)) {
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
    // OPTIMIZATION: No select() - just update without returning
    const { error } = await buildQuery(nextPayload);
    if (!error) return;

    const missingColumn = getMissingSchemaColumn(error, 'materials');
    if (!missingColumn || !OPTIONAL_MATERIAL_COLUMNS.has(missingColumn) || removedColumns.has(missingColumn)) {
      throw error;
    }

    removedColumns.add(missingColumn);
    nextPayload = omitKey(nextPayload, missingColumn);
  }
};

// ==========================================
// OPTIMIZED: Fetch with field selection
// ==========================================

/**
 * OPTIMIZED: Fetch approved materials with pagination
 * BEFORE: .select('*') - fetched all columns
 * AFTER: .select(MATERIAL_LIST_FIELDS) - fetches only needed columns
 * ADDED: Pagination support with range()
 */
export const fetchApprovedMaterials = async (type, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const baseQuery = () =>
    supabase
      .from('materials')
      .select(MATERIAL_LIST_FIELDS, { count: 'exact' }) // OPTIMIZATION: Specific fields
      .eq('status', 'approved')
      .eq('type', type)
      .order('created_at', { ascending: false })
      .range(start, end); // OPTIMIZATION: Pagination

  let response = await baseQuery();

  // Fallback for missing 'type' column
  if (getMissingSchemaColumn(response.error, 'materials') === 'type') {
    response = await supabase
      .from('materials')
      .select(MATERIAL_LIST_FIELDS, { count: 'exact' })
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(start, end);
  }

  const { data, error, count } = response;
  if (error) throw error;

  return {
    data: (data || []).filter((material) => getMaterialType(material) === type),
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

/**
 * OPTIMIZED: Fetch pending materials with pagination
 */
export const fetchPendingMaterials = async (options = {}) => {
  const { type, page = 1, limit = 20 } = options;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const baseQuery = () =>
    supabase
      .from('materials')
      .select(MATERIAL_ADMIN_FIELDS, { count: 'exact' }) // OPTIMIZATION: Admin fields only
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(start, end);

  let response = type ? await baseQuery().eq('type', type) : await baseQuery();

  if (type && getMissingSchemaColumn(response.error, 'materials') === 'type') {
    response = await baseQuery();
  }

  const { data, error, count } = response;
  if (error) throw error;

  const materials = data || [];
  return {
    data: type ? materials.filter((m) => getMaterialType(m) === type) : materials,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
};

/**
 * OPTIMIZED: Fetch student's materials with limited fields
 */
export const fetchStudentMaterials = async (userId, options = {}) => {
  const { limit = 50 } = options;

  const { data, error } = await supabase
    .from('materials')
    .select(MATERIAL_LIST_FIELDS) // OPTIMIZATION: Specific fields
    .or(`uploaded_by.eq.${userId},user_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit); // OPTIMIZATION: Limit results

  if (error) throw error;
  return data || [];
};

/**
 * OPTIMIZED: Fetch single material detail
 */
export const fetchMaterialById = async (id) => {
  const { data, error } = await supabase
    .from('materials')
    .select(MATERIAL_DETAIL_FIELDS) // OPTIMIZATION: Detail fields only
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// ==========================================
// OPTIMIZED: Material creation with minimal return
// ==========================================

export const createMaterialUpload = async ({
  title, description, subject, category, year, file, user,
}) => {
  const { session, client } = await getAuthenticatedDataClient();
  const activeUserId = session.user.id;
  const type = getMaterialType(category);
  
  const filePath = await uploadMaterialFile({ file, userId: activeUserId, type });
  
  const {
    displayCategory, legacyMaterialType, iconType, bgColor, textColor,
  } = getCategoryPresentation(category, type);

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
    created_at: new Date().toISOString(),
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
    // OPTIMIZATION: Returns minimal data (id, title, status, created_at)
    return await insertMaterialWithCompatibility(client, payload);
  } catch (error) {
    try { await removeStoredMaterialFile(filePath); }
    catch (cleanupError) { console.error('Failed to clean up storage:', cleanupError); }
    throw withUploadPolicyGuidance(error, 'materials');
  }
};

// ==========================================
// OPTIMIZED: Approval with minimal return
// ==========================================

export const approveMaterialUpload = async ({ material, adminUserId }) => {
  const rewardAmount = getMaterialApprovalReward(material);
  const uploaderId = material?.uploaded_by || material?.user_id;
  const approvedAt = new Date().toISOString();

  // OPTIMIZATION: Update without returning full row
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

  return { rewardAmount: uploaderId ? rewardAmount : 0 };
};

export const rejectMaterialUpload = async (materialId) => {
  // OPTIMIZATION: No select() - just update
  const { error } = await supabase
    .from('materials')
    .update({ status: 'rejected' })
    .eq('id', materialId)
    .eq('status', 'pending');

  if (error) throw error;
};

export const deleteMaterialUpload = async (material) => {
  // OPTIMIZATION: No select() - just delete
  const { error } = await supabase.from('materials').delete().eq('id', material.id);
  if (error) throw error;

  try {
    await removeStoredMaterialFile(material.file_url, material.storage_bucket || MATERIALS_BUCKET);
  } catch (cleanupError) {
    console.error('Failed to remove storage asset:', cleanupError);
  }
};

// ==========================================
// File upload utilities (unchanged core logic)
// ==========================================

const buildStoragePath = ({ userId, type, fileName }) => {
  const extension = getFileExtension(fileName);
  const nameWithoutExtension = extension ? fileName.slice(0, -(extension.length + 1)) : fileName;
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '');
  const safeFileName = slugify(nameWithoutExtension, 'upload');
  return `${userId}/${type}/${timestamp}-${safeFileName}${extension ? `.${extension}` : ''}`;
};

export const uploadMaterialFile = async ({ file, userId, type }) => {
  const { client } = await getAuthenticatedDataClient();
  const filePath = buildStoragePath({ userId, type, fileName: file?.name || 'upload' });

  const { error } = await client.storage.from(MATERIALS_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file?.type || undefined,
  });

  if (error) {
    throw withUploadPolicyGuidance(withBucketSetupGuidance(error, MATERIALS_BUCKET), 'storage', MATERIALS_BUCKET);
  }

  return filePath;
};

export const removeStoredMaterialFile = async (filePath, bucketName = MATERIALS_BUCKET) => {
  if (!filePath || isAbsoluteUrl(filePath)) return;
  const { client } = await getAuthenticatedDataClient();
  const { error } = await client.storage.from(bucketName).remove([filePath]);
  if (error) throw withBucketSetupGuidance(error, bucketName);
};

// ==========================================
// Helper functions (unchanged)
// ==========================================

export const getMaterialType = (value) => {
  if (typeof value === 'object' && value !== null) {
    return getMaterialType(value.type || value.material_type || value.category);
  }
  const normalizedValue = getTrimmedString(value).toLowerCase();
  return normalizedValue === 'pyq' ? 'pyq' : 'material';
};

export const getMaterialApprovalReward = (material) =>
  APPROVAL_REWARDS[getMaterialType(material)] || APPROVAL_REWARDS.material;

export const getMaterialStatus = (material) =>
  getTrimmedString(material?.status).toLowerCase() || 'pending';

export const isMaterialApproved = (material) => getMaterialStatus(material) === 'approved';

export const getMaterialStatusLabel = (material) => {
  const status = getMaterialStatus(material);
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return 'Pending Review';
};

export const getMaterialFileExtension = (material) => {
  const fileName = getTrimmedString(material?.file_name);
  const storedFileReference = getTrimmedString(material?.file_url);
  const fileType = getTrimmedString(material?.file_type);

  if (fileName) return getFileExtension(fileName);
  if (fileType) return fileType.replace(/^./, '').toLowerCase();
  if (!storedFileReference) return '';

  const normalizedReference = storedFileReference.split('?')[0];
  return getFileExtension(normalizedReference);
};

export const getMaterialPreviewKind = (material) => {
  const extension = getMaterialFileExtension(material);
  if (PDF_FILE_EXTENSIONS.has(extension)) return 'pdf';
  if (IMAGE_FILE_EXTENSIONS.has(extension)) return 'image';
  return 'unsupported';
};

export const canPreviewMaterial = (material, { viewerRole = 'student' } = {}) =>
  viewerRole === 'admin' || isMaterialApproved(material);

export const getMaterialAccessUrl = async (material, { viewerRole = 'student' } = {}) => {
  if (!canPreviewMaterial(material, { viewerRole })) {
    throw new Error('Only approved files are visible to students.');
  }

  const fileReference = getTrimmedString(material?.file_url);
  if (!fileReference) throw new Error('No file was attached to this material.');
  if (isAbsoluteUrl(fileReference)) return fileReference;

  const bucketName = material?.storage_bucket || MATERIALS_BUCKET;
  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileReference);

  if (!data?.publicUrl) {
    throw new Error(`Unable to create a public URL for "${fileReference}".`);
  }
  return data.publicUrl;
};

export const getMaterialPreviewData = async (material, { viewerRole = 'student' } = {}) => {
  const publicUrl = await getMaterialAccessUrl(material, { viewerRole });
  const previewKind = getMaterialPreviewKind(material);

  try { await bumpMaterialMetric(material, 'views'); }
  catch (error) { console.error('Failed to update view count:', error); }

  return { url: publicUrl, previewKind, isPreviewSupported: previewKind !== 'unsupported' };
};

export const previewMaterialFile = async (material, { viewerRole = 'student' } = {}) => {
  const publicUrl = await getMaterialAccessUrl(material, { viewerRole });
  try { await bumpMaterialMetric(material, 'views'); }
  catch (error) { console.error('Failed to update view count:', error); }
  window.open(publicUrl, '_blank', 'noopener,noreferrer');
  return publicUrl;
};

export const downloadMaterialFile = async (material, { viewerRole = 'student' } = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Please login to download materials');

  const uploaderId = material?.uploaded_by || material?.user_id || null;
  const isSelfDownload = uploaderId === user.id;
  const price = material?.price ?? 5;

  // Self-download: no coin deduction
  if (isSelfDownload) {
    const publicUrl = await getMaterialAccessUrl(material, { viewerRole });
    try { await bumpMaterialMetric(material, 'downloads'); }
    catch (err) { console.error('Failed to update download count:', err); }

    try {
      const response = await fetch(publicUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = material?.file_name || material?.title || `material-${material?.id || 'download'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(publicUrl, '_blank');
    }
    return publicUrl;
  }

  // Other user's material: use RPC
  const { data: rpcResult, error: rpcError } = await supabase.rpc('process_material_download', {
    p_material_id: material.id,
    p_buyer_id: user.id,
    p_uploader_id: uploaderId,
    p_price: price,
  });

  if (rpcError) throw new Error(rpcError.message || 'Failed to process download.');
  if (!rpcResult?.success) throw new Error(rpcResult?.error || 'Failed to process download.');

  const publicUrl = await getMaterialAccessUrl(material, { viewerRole });
  try {
    const response = await fetch(publicUrl);
    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = material?.file_name || material?.title || `material-${material?.id || 'download'}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(publicUrl, '_blank');
  }

  return publicUrl;
};

const bumpMaterialMetric = async (material, fieldName) => {
  if (!material?.id) return;
  const nextValue = Number(material?.[fieldName] || 0) + 1;
  const { error } = await supabase
    .from('materials')
    .update({ [fieldName]: nextValue })
    .eq('id', material.id);
  if (error) throw error;
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
    const config = {
      Interview: { iconType: 'Briefcase', bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
      Core: { iconType: 'PlayCircle', bgColor: 'bg-rose-100', textColor: 'text-rose-600' },
      Aptitude: { iconType: 'BookOpen', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
    };
    const { iconType, bgColor, textColor } = config[placementCategory] || {
      iconType: 'BookOpen', bgColor: 'bg-blue-100', textColor: 'text-blue-600'
    };
    return { displayCategory: placementCategory, legacyMaterialType: 'Placement', iconType, bgColor, textColor };
  }

  if (normalizedCategory === 'Assignment') {
    return { displayCategory: normalizedCategory, legacyMaterialType: 'Material', iconType: 'BookOpen', bgColor: 'bg-amber-100', textColor: 'text-amber-600' };
  }

  return { displayCategory: normalizedCategory, legacyMaterialType: 'Material', iconType: 'BookOpen', bgColor: 'bg-blue-100', textColor: 'text-blue-600' };
};
