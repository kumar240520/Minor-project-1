import { supabase } from '../supabaseClient';

const VALID_ROLES = new Set(['student', 'admin']);

const getTrimmedString = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
};

export const getDisplayName = (source, fallback = 'Student') => {
  // First try direct name fields (for database profiles)
  const directName =
    getTrimmedString(source?.name) ??
    getTrimmedString(source?.full_name);

  if (directName) {
    return directName;
  }

  // Then try auth metadata fields (for Supabase Auth user objects)
  const metadataName =
    getTrimmedString(source?.user_metadata?.name) ??
    getTrimmedString(source?.user_metadata?.full_name);

  if (metadataName) {
    return metadataName;
  }

  // Final fallback - only use email prefix if no other option exists
  if (!source) return fallback;
  
  // For database profiles, prefer fallback over email prefix
  if (source.name === undefined && source.full_name === undefined) {
    return source.user_metadata?.full_name || source.email?.split('@')[0] || fallback;
  }
  
  // For database profiles with empty name fields, use fallback
  return fallback;
};

const hasMissingColumnError = (error, columnName) => {
  const message = error?.message?.toLowerCase() || '';
  return (
    message.includes(`column '${columnName.toLowerCase()}'`) ||
    message.includes(`column "${columnName.toLowerCase()}"`) ||
    message.includes(`'${columnName.toLowerCase()}' column`) ||
    message.includes(`"${columnName.toLowerCase()}" column`)
  );
};

export const isRowLevelSecurityError = (error) =>
  (error?.message?.toLowerCase() || '').includes('row-level security');

export const getFirstName = (source, fallback = 'Student') => {
  const displayName = getDisplayName(source, fallback);
  return displayName.split(/\s+/)[0] || fallback;
};

export const getDisplayInitial = (source, fallback = '?') => {
  const displayName = getDisplayName(source, '');
  return displayName ? displayName.charAt(0).toUpperCase() : fallback;
};

export class MissingUserRoleError extends Error {
  constructor(message = 'No user role was found in the users table for this account.') {
    super(message);
    this.name = 'MissingUserRoleError';
  }
}

export class InvalidUserRoleError extends Error {
  constructor(role) {
    super(`Unsupported user role "${role}".`);
    this.name = 'InvalidUserRoleError';
    this.role = role;
  }
}

export const getRedirectPathForRole = (role) =>
  role === 'admin' ? '/admin/dashboard' : '/dashboard';

export const isValidInstitutionalEmail = (email) => {
  if (!email) return false;
  const lowerEmail = email.toLowerCase().trim();
  // Specifically enforcing start with 0808 and end with .ies@ipsacademy.org
  return lowerEmail.startsWith('0808') && lowerEmail.endsWith('.ies@ipsacademy.org');
};

export const getAuthenticatedUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
};

export const fetchUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.role) {
    throw new MissingUserRoleError();
  }

  if (!VALID_ROLES.has(data.role)) {
    throw new InvalidUserRoleError(data.role);
  }

  return data;
};

export const initializeStudentProfileForUser = async (user) => {
  if (!user?.id) {
    throw new Error('No authenticated user was available to initialize a student profile.');
  }

  // Try to get the real name from multiple sources in order of preference
  const realName = getTrimmedString(user?.user_metadata?.full_name) ||
                   getTrimmedString(user?.user_metadata?.name) ||
                   getTrimmedString(user?.user_metadata?.displayName) ||
                   getDisplayName(user); // Fallback to email-based name

  await ensureStudentProfile({
    id: user.id,
    email: user.email,
    fullName: realName,
  });

  return fetchUserProfile(user.id);
};

export const getAuthenticatedUserWithRole = async ({ initializeStudentProfile = false } = {}) => {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { user: null, role: null, profile: null };
  }

  let profile;

  try {
    profile = await fetchUserProfile(user.id);
  } catch (error) {
    if (!(initializeStudentProfile && error instanceof MissingUserRoleError)) {
      throw error;
    }

    profile = await initializeStudentProfileForUser(user);
  }

  return {
    user,
    role: profile.role,
    profile,
  };
};

export const ensureStudentProfile = async ({ id, email, fullName }) => {
  // Use the provided fullName if available, otherwise fall back to email-based name
  const displayName = fullName || getDisplayName({ email });
  
  console.log("ensureStudentProfile called with:", { id, email, fullName, displayName });
  
  const upsertOptions = {
    onConflict: 'id',
    ignoreDuplicates: true,
  };

  // Try to insert with both name and full_name fields
  let { error, data } = await supabase.from('users').upsert(
    [
      {
        id,
        email,
        name: displayName,
        full_name: displayName, // Store in both fields for consistency
        role: 'student',
      },
    ],
    upsertOptions,
  );

  console.log("First upsert attempt - Error:", error, "Data:", data);

  // If name column doesn't exist, try with just full_name
  if (error && hasMissingColumnError(error, 'name')) {
    console.log("Name column missing, trying with full_name only");
    ({ error, data } = await supabase.from('users').upsert(
      [
        {
          id,
          email,
          full_name: displayName,
          role: 'student',
        },
      ],
      upsertOptions,
    ));
    console.log("Second upsert attempt - Error:", error, "Data:", data);
  }

  // If full_name column doesn't exist, try with just name
  if (error && hasMissingColumnError(error, 'full_name')) {
    console.log("Full_name column missing, trying with name only");
    ({ error, data } = await supabase.from('users').upsert(
      [
        {
          id,
          email,
          name: displayName,
          role: 'student',
        },
      ],
      upsertOptions,
    ));
    console.log("Third upsert attempt - Error:", error, "Data:", data);
  }

  if (error) {
    console.error("Final error in ensureStudentProfile:", error);
    throw error;
  }
  
  console.log("Profile successfully stored in database");
};
