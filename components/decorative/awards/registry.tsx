/**
 * Библиотека наград (страница 4, шаблон "Команда" — QA: "предусмотрена
 * часть с наградами... подготовить награды по НГ-шке... вшить, и в
 * теле редактора можно будет вставлять те награды, которыми кто-то
 * награждён"). Тот же принцип, что и у фоновых гравюр (PRIORITY 6,
 * см. components/decorative/engravings/registry.tsx): единственное
 * место, где id награды сопоставлен с картинкой значка — AwardPicker
 * (редактор) и рендер в TeamFaces оба читают отсюда, а не хранят
 * список изображений каждый по-своему.
 *
 * В отличие от гравюр (одна на страницу, выбор через radio), наград на
 * одном фото может быть НЕСКОЛЬКО (человек награждён не одной медалью)
 * — AwardOption.id используется как элемент массива photo.awardIds, а
 * не как единственное значение поля.
 *
 * Первые 4 награды предоставлены пользователем напрямую (как и гравюры
 * страниц 3–4) — фото медали/ордена на однотонном фоне, обрезанные по
 * содержимому и уменьшенные до иконочного размера. Как только появятся
 * ещё, каждая добавляется сюда тем же приёмом: файл в
 * public/awards/<id>.jpg (или .png), запись в AWARD_OPTIONS с
 * человекочитаемым label.
 */
export type AwardOption = {
  id: string;
  label: string;
  /** Путь к изображению значка в /public — потребляется и
   *  веб-превью (обычный <img>), и инлайнером PDF
   *  (lib/pdf/inlineStaticImages.ts уже инлайнит любой src из
   *  /awards/ так же общо, как /engravings/ и /emblems/). */
  src: string;
};

export const AWARD_OPTIONS: AwardOption[] = [
  { id: "award-georgiy-zhukov", label: "Медаль «Георгий Жуков»", src: "/awards/award-georgiy-zhukov.jpg" },
  { id: "award-za-otvagu", label: "Медаль «За отвагу»", src: "/awards/award-za-otvagu.jpg" },
  {
    id: "award-za-boevye-otlichiya",
    label: "Медаль «За боевые отличия»",
    src: "/awards/award-za-boevye-otlichiya.jpg",
  },
  { id: "award-order-muzhestva", label: "Орден Мужества", src: "/awards/award-order-muzhestva.jpg" },
];

export function awardById(id: string): AwardOption | undefined {
  return AWARD_OPTIONS.find((a) => a.id === id);
}
