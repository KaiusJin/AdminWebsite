export async function loadMediaAssets(client, signal) {
  const { data, error } = await client
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false })
    .abortSignal(signal);
  if (error) throw error;
  return (data || []).map(asset => ({
    ...asset,
    url: client.storage.from("journey-media").getPublicUrl(asset.path).data.publicUrl,
  }));
}

export async function uploadMedia(client, file, alt) {
  const id = crypto.randomUUID();
  const extension = file.name.split('.').pop().replace(/[^a-z0-9]/gi, '').toLowerCase();
  const path = `${id}.${extension || 'bin'}`;
  const { error: uploadError } = await client.storage
    .from('journey-media')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;

  const { error: databaseError } = await client
    .from('media_assets')
    .insert({ id, path, name: file.name, mime: file.type, size: file.size, alt });
  if (databaseError) throw Error(`File uploaded, but metadata could not be saved. ${databaseError.message} Path: ${path}`);
}
