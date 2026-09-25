/** Читает загруженный файл как data URL — тот же формат, в котором
 *  уже хранятся фотографии в ContentBlock (MVP без сервера, см.
 *  lib/content/types.ts). Используется полем "Изображение" в
 *  редакторе обложки и фото-блоками страниц 2–4. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
