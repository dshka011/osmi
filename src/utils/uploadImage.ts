import supabase from '../supabaseClient';

export async function uploadImageToStorage(base64: string, pathPrefix: string): Promise<string> {
  // Генерируем уникальное имя файла
  const fileName = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.png`;
  // Преобразуем base64 в Blob
  const base64Data = base64.split(',')[1];
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/png' });

  // Загружаем в Supabase Storage
  const { error } = await supabase.storage.from('images').upload(fileName, blob, {
    cacheControl: '3600',
    upsert: false,
    contentType: 'image/png',
  });
  if (error) throw error;

  // Получаем публичную ссылку
  const { data } = supabase.storage.from('images').getPublicUrl(fileName);
  if (!data?.publicUrl) throw new Error('Не удалось получить ссылку на изображение');
  return data.publicUrl;
} 