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
  const directName =
    getTrimmedString(source?.name) ??
    getTrimmedString(source?.full_name) ??
    getTrimmedString(source?.user_metadata?.name) ??
    getTrimmedString(source?.user_metadata?.full_name);

  if (directName) {
    return directName;
  }
  
  if (!source) return fallback;
  return source.user_metadata?.full_name || source.email?.split('@')[0] || fallback;
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
  role === 'admin' ? '/admin-dashboard' : '/dashboard';

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

  await ensureStudentProfile({
    id: user.id,
    email: user.email,
    fullName: getDisplayName(user),
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
  const displayName = getDisplayName({ name: fullName, email });
  const upsertOptions = {
    onConflict: 'id',
    ignoreDuplicates: true,
  };

  let { error } = await supabase.from('users').upsert(
    [
      {
        id,
        email,
        name: displayName,
        role: 'student',
      },
    ],
    upsertOptions,
  );

  if (error && hasMissingColumnError(error, 'name')) {
    ({ error } = await supabase.from('users').upsert(
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
  }

  if (error) {
    throw error;
  }
};
