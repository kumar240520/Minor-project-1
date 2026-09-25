const { supabase } = require('../supabaseClient');

/**
 * Helper to determine if a material record is a PYQ (Previous Year Question)
 */
const isPyqRecord = (item) => {
  if (!item) return false;
  if (item.type === 'pyq') return true;
  if (item.category && String(item.category).trim().toLowerCase() === 'pyq') return true;
  if (item.material_type && String(item.material_type).trim().toLowerCase() === 'pyq') return true;
  
  const title = (item.title || '').toLowerCase();
  const subject = (item.subject || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const fileName = (item.file_name || '').toLowerCase();

  return /pyq|previous\s*year|question\s*paper|mst|end\s*sem|mid\s*sem/i.test(`${title} ${subject} ${desc} ${fileName}`);
};

/**
 * Format material item with storage public URLs and categorized flags
 */
const formatMaterialItem = (item) => {
  const isPyq = isPyqRecord(item);
  const bucket = item.storage_bucket || 'Storage';
  
  let publicUrl = '';
  if (item.file_url) {
    if (/^https?:\/\//i.test(item.file_url)) {
      publicUrl = item.file_url;
    } else {
      const { data } = supabase.storage.from(bucket).getPublicUrl(item.file_url);
      publicUrl = data?.publicUrl || '';
    }
  }

  // Detect file extension/type
  const fileName = item.file_name || item.file_url || '';
  const ext = fileName.split('.').pop().toLowerCase();
  const previewKind = ['pdf'].includes(ext) 
    ? 'pdf' 
    : ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext) 
      ? 'image' 
      : 'unsupported';

  return {
    ...item,
    is_pyq: isPyq,
    computed_type: isPyq ? 'pyq' : 'material',
    badge_label: isPyq ? 'PYQ' : (item.category || 'Notes'),
    preview_url: publicUrl,
    preview_kind: previewKind,
    direct_download_url: `/api/materials/${item.id}/download`,
    download_url: publicUrl,
    file_type: item.file_type || ext.toUpperCase() || 'PDF'
  };
};

/**
 * 1. Global Multi-Field Search Endpoint
 * GET /api/search?q=...&type=...&limit=...
 */
const search = async (req, res) => {
  try {
    const rawQuery = (req.query.q || req.query.query || '').trim();
    const typeFilter = (req.query.type || 'all').toLowerCase(); // 'all' | 'pyq' | 'material' | 'notes'
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

    // If query is empty, return popular / trending resources
    if (!rawQuery) {
      const { data: popular, error: popError } = await supabase
        .from('materials')
        .select('*')
        .eq('status', 'approved')
        .order('downloads', { ascending: false })
        .limit(limit);

      if (popError) {
        throw popError;
      }

      const formatted = (popular || []).map(formatMaterialItem);
      const pyqs = formatted.filter(m => m.is_pyq);
      const materials = formatted.filter(m => !m.is_pyq);

      return res.json({
        success: true,
        query: '',
        counts: {
          total: formatted.length,
          pyqs: pyqs.length,
          materials: materials.length
        },
        results: {
          all: formatted,
          pyqs,
          materials
        }
      });
    }

    // Split query terms for smart multi-word matching (e.g. "ADA pyq 2025")
    const terms = rawQuery.split(/\s+/).filter(Boolean);
    const mainTerm = terms[0];

    // Build PostgREST query on materials table
    // Matches across title, subject, description, file_name, category, material_type, and year
    let dbQuery = supabase
      .from('materials')
      .select('*')
      .eq('status', 'approved');

    // Build OR filter for the search phrase
    const orConditions = [
      `title.ilike.%${rawQuery}%`,
      `subject.ilike.%${rawQuery}%`,
      `description.ilike.%${rawQuery}%`,
      `file_name.ilike.%${rawQuery}%`,
      `category.ilike.%${rawQuery}%`,
      `material_type.ilike.%${rawQuery}%`
    ];

    // Also match individual terms if multi-word
    if (terms.length > 1) {
      terms.forEach(term => {
        if (term.length > 2) {
          orConditions.push(`title.ilike.%${term}%`);
          orConditions.push(`subject.ilike.%${term}%`);
        }
      });
    }

    dbQuery = dbQuery.or(orConditions.join(','));

    // Apply explicit type filter if requested
    if (typeFilter === 'pyq') {
      dbQuery = dbQuery.or('type.eq.pyq,category.ilike.%pyq%');
    } else if (typeFilter === 'material' || typeFilter === 'notes') {
      dbQuery = dbQuery.or('type.eq.material,category.ilike.%notes%');
    }

    const { data: matchedRecords, error } = await dbQuery.limit(50);

    if (error) {
      console.error('Search Supabase query error:', error);
      throw error;
    }

    const qLower = rawQuery.toLowerCase();

    // Score and rank results by relevance
    const scored = (matchedRecords || []).map(record => {
      let score = 0;
      const titleLower = (record.title || '').toLowerCase();
      const subjectLower = (record.subject || '').toLowerCase();
      const descLower = (record.description || '').toLowerCase();
      const fileNameLower = (record.file_name || '').toLowerCase();

      // Exact title match gets highest score
      if (titleLower === qLower) score += 100;
      else if (titleLower.startsWith(qLower)) score += 60;
      else if (titleLower.includes(qLower)) score += 40;

      // Subject matches
      if (subjectLower === qLower) score += 50;
      else if (subjectLower.includes(qLower)) score += 30;

      // Multi-term matches
      terms.forEach(term => {
        const t = term.toLowerCase();
        if (titleLower.includes(t)) score += 15;
        if (subjectLower.includes(t)) score += 10;
        if (descLower.includes(t)) score += 5;
        if (fileNameLower.includes(t)) score += 5;
      });

      // Boost by popularity/downloads
      score += Math.min(record.downloads || 0, 20);

      return {
        ...formatMaterialItem(record),
        _score: score
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b._score - a._score);

    // Filter by type if requested
    let filtered = scored;
    if (typeFilter === 'pyq') {
      filtered = scored.filter(item => item.is_pyq);
    } else if (typeFilter === 'material' || typeFilter === 'notes') {
      filtered = scored.filter(item => !item.is_pyq);
    }

    const pyqs = filtered.filter(item => item.is_pyq);
    const materials = filtered.filter(item => !item.is_pyq);
    const all = filtered.slice(0, limit);

    return res.json({
      success: true,
      query: rawQuery,
      counts: {
        total: filtered.length,
        pyqs: pyqs.length,
        materials: materials.length
      },
      results: {
        all,
        pyqs: pyqs.slice(0, limit),
        materials: materials.slice(0, limit)
      }
    });
  } catch (err) {
    console.error('Error in searchController.search:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to execute search',
      error: err.message
    });
  }
};

/**
 * 2. Search Suggestions & Popular Resources
 * GET /api/search/suggestions
 */
const getSuggestions = async (req, res) => {
  try {
    // Fetch top 5 popular PYQs and top 5 popular notes
    const { data: popular, error } = await supabase
      .from('materials')
      .select('id, title, subject, type, category, downloads, file_name, file_url, storage_bucket, year')
      .eq('status', 'approved')
      .order('downloads', { ascending: false })
      .limit(30);

    if (error) throw error;

    const formatted = (popular || []).map(formatMaterialItem);
    const topPyqs = formatted.filter(m => m.is_pyq).slice(0, 5);
    const topMaterials = formatted.filter(m => !m.is_pyq).slice(0, 5);

    // Extract unique subjects
    const uniqueSubjects = [
      ...new Set((popular || []).map(m => m.subject).filter(Boolean))
    ].slice(0, 10);

    return res.json({
      success: true,
      suggestions: {
        subjects: uniqueSubjects,
        trendingPyqs: topPyqs,
        trendingMaterials: topMaterials
      }
    });
  } catch (err) {
    console.error('Error in getSuggestions:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch suggestions',
      error: err.message
    });
  }
};

/**
 * 3. Direct File Streaming / Download Endpoint
 * GET /api/materials/:id/download
 */
const downloadFile = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Fetch material record
    const { data: material, error: fetchError } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !material) {
      return res.status(404).json({
        success: false,
        message: 'Study material or PYQ not found'
      });
    }

    // 2. Increment download count asynchronously
    const nextDownloads = (material.downloads || 0) + 1;
    supabase
      .from('materials')
      .update({ downloads: nextDownloads })
      .eq('id', id)
      .then(() => {})
      .catch(err => console.error('Failed to bump download metric:', err));

    const bucket = material.storage_bucket || 'Storage';
    const fileReference = material.file_url;

    if (!fileReference) {
      return res.status(400).json({
        success: false,
        message: 'No file is attached to this resource'
      });
    }

    // If file_url is already an absolute external link, redirect to it
    if (/^https?:\/\//i.test(fileReference)) {
      return res.redirect(fileReference);
    }

    // Try downloading the file blob from Supabase storage and streaming with Content-Disposition
    try {
      const { data: fileBlob, error: downloadError } = await supabase
        .storage
        .from(bucket)
        .download(fileReference);

      if (!downloadError && fileBlob) {
        const buffer = Buffer.from(await fileBlob.arrayBuffer());
        const safeName = (material.file_name || material.title || `material-${material.id}`)
          .replace(/[^a-zA-Z0-9._-]/g, '_');
        const ext = safeName.includes('.') ? '' : '.pdf';
        const finalName = `${safeName}${ext}`;

        res.setHeader('Content-Type', material.file_type || fileBlob.type || 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${finalName}"`);
        res.setHeader('Content-Length', buffer.length);
        return res.send(buffer);
      }
    } catch (streamErr) {
      console.warn('Storage stream download failed, falling back to publicUrl redirect:', streamErr);
    }

    // Fallback: Redirect to public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileReference);
    if (urlData?.publicUrl) {
      return res.redirect(urlData.publicUrl);
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to access the file from storage'
    });
  } catch (err) {
    console.error('Error in downloadFile:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing download',
      error: err.message
    });
  }
};

/**
 * 4. Record Download Metric & Return Info Endpoint
 * POST /api/materials/:id/download
 */
const recordDownload = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: material, error: fetchError } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Bump downloads
    const nextDownloads = (material.downloads || 0) + 1;
    await supabase
      .from('materials')
      .update({ downloads: nextDownloads })
      .eq('id', id);

    const formatted = formatMaterialItem({
      ...material,
      downloads: nextDownloads
    });

    return res.json({
      success: true,
      message: 'Download registered successfully',
      downloads: nextDownloads,
      material: formatted,
      download_url: formatted.preview_url
    });
  } catch (err) {
    console.error('Error in recordDownload:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to record download',
      error: err.message
    });
  }
};

/**
 * 5. Get Single Material by ID
 * GET /api/materials/:id
 */
const getMaterialById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: material, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    return res.json({
      success: true,
      material: formatMaterialItem(material)
    });
  } catch (err) {
    console.error('Error in getMaterialById:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to get material',
      error: err.message
    });
  }
};

module.exports = {
  search,
  getSuggestions,
  downloadFile,
  recordDownload,
  getMaterialById
};
