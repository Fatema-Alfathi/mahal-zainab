import type { DressColor } from "@/types";

export const DRESS_COLOR_SWATCH: Record<DressColor, string> = {
  أبيض: "#f7f4ee",
  عاجي: "#f0e2c4",
  سكري: "#f4ecd4",
  شمبانيا: "#ead7b0",
  ذهبي: "#d4b15a",
  فضي: "#c8cdd3",
  نحاسي: "#b87333",
  وردي: "#e8a0b4",
  مشمشي: "#f0b27a",
  مرجاني: "#e07a6a",
  أحمر: "#c0392b",
  خمري: "#7b2d3b",
  عنابي: "#6b1d2a",
  أسود: "#1f1f1f",
  كحلي: "#1b2a4a",
  أزرق: "#3d6ea8",
  تركواز: "#3aa8a4",
  أخضر: "#4a7c59",
  فستقي: "#9cbf6b",
  نعناعي: "#7dcaa5",
  زيتي: "#6b6b2b",
  بنفسجي: "#7a4ea3",
  ليلكي: "#b49ad6",
  بيج: "#d8c4a8",
  نود: "#d2b09a",
  بني: "#7a4f32",
  رمادي: "#8b8f94",
};

export function dressColorSwatch(color: string): string {
  return DRESS_COLOR_SWATCH[color as DressColor] ?? "#d4c4b0";
}
