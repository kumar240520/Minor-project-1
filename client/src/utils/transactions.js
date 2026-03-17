import { supabase } from '../supabaseClient';

const OPTIONAL_TRANSACTION_COLUMNS = new Set([
  'description',
  'source',
  'reference_id',
  'status',
  'type',
  'reference_type',
  'transaction_type',
]);

const getTrimmedString = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const getMissingSchemaColumn = (error, tableName = 'transactions') => {
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

const insertTransactionWithCompatibility = async (payload) => {
  let nextPayload = { ...payload };
  const removedColumns = new Set();

  while (true) {
    const { error } = await supabase.from('transactions').insert([nextPayload]);

    if (!error) {
      return;
    }

    const missingColumn = getMissingSchemaColumn(error, 'transactions');

    if (
      !missingColumn ||
      !OPTIONAL_TRANSACTION_COLUMNS.has(missingColumn) ||
      removedColumns.has(missingColumn)
    ) {
      throw error;
    }

    removedColumns.add(missingColumn);
    nextPayload = omitKey(nextPayload, missingColumn);
  }
};

export const getTransactionType = (transaction) => {
  const explicitType = getTrimmedString(transaction?.type).toLowerCase();

  if (explicitType) {
    return explicitType;
  }

  const legacyType = getTrimmedString(transaction?.transaction_type).toLowerCase();

  if (legacyType === 'earn') {
    return 'reward';
  }

  if (legacyType === 'spend') {
    return 'purchase';
  }

  return 'unknown';
};

export const getTransactionStatus = (transaction) =>
  getTrimmedString(transaction?.status).toLowerCase() || 'completed';

export const getTransactionSource = (transaction) =>
  getTrimmedString(transaction?.source) || getTrimmedString(transaction?.reference_type);

export const getTransactionDescription = (transaction) => {
  const description = getTrimmedString(transaction?.description);

  if (description) {
    return description;
  }

  const source = getTransactionSource(transaction);

  if (source) {
    return `Transaction source: ${source}`;
  }

  if (getTransactionType(transaction) === 'reward') {
    return 'Reward transaction';
  }

  return 'Transaction record';
};

export const isRewardTransaction = (transaction) => {
  if (getTransactionType(transaction) === 'reward') {
    return true;
  }

  const source = getTransactionSource(transaction).toLowerCase();
  return Number(transaction?.amount || 0) > 0 && /(reward|approval)/i.test(source);
};

export const createRewardTransaction = async ({
  userId,
  amount,
  source,
  referenceId,
  description,
}) => {
  await insertTransactionWithCompatibility({
    user_id: userId,
    amount,
    type: 'reward',
    source,
    reference_id: referenceId,
    description,
    status: 'completed',
    reference_type: source,
    transaction_type: 'EARN',
  });
};

export const createPurchaseTransaction = async ({
  userId,
  amount,
  source,
  referenceId,
  description,
}) => {
  await insertTransactionWithCompatibility({
    user_id: userId,
    amount: Math.abs(amount),
    type: 'purchase',
    source,
    reference_id: referenceId,
    description,
    status: 'completed',
    reference_type: source,
    transaction_type: 'SPEND',
  });
};

export const fetchTransactionsWithUsers = async ({ limit } = {}) => {
  let query = supabase
    .from('transactions')
    .select(`
      *,
      users!transactions_user_id_fkey ( * )
    `)
    .order('created_at', { ascending: false });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
};

export const fetchRewardTransactions = async ({ limit = 8 } = {}) => {
  let query = supabase
    .from('transactions')
    .select(`
      *,
      users!transactions_user_id_fkey ( * )
    `)
    .eq('type', 'reward')
    .order('created_at', { ascending: false })
    .limit(limit);

  let response = await query;

  if (getMissingSchemaColumn(response.error, 'transactions') === 'type') {
    response = await supabase
      .from('transactions')
      .select(`
        *,
        users!transactions_user_id_fkey ( * )
      `)
      .order('created_at', { ascending: false })
      .limit(limit * 3);
  }

  if (response.error) {
    throw response.error;
  }

  return (response.data || []).filter(isRewardTransaction).slice(0, limit);
};

export const fetchCompletedRewardTransactions = async () => {
  let response = await supabase
    .from('transactions')
    .select('*')
    .eq('status', 'completed')
    .eq('type', 'reward');

  const missingColumn = getMissingSchemaColumn(response.error, 'transactions');

  if (missingColumn === 'status' || missingColumn === 'type') {
    response = await supabase.from('transactions').select('*');
  }

  if (response.error) {
    throw response.error;
  }

  return (response.data || []).filter(
    (transaction) =>
      isRewardTransaction(transaction) && getTransactionStatus(transaction) === 'completed',
  );
};
