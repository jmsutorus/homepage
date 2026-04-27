import { RestaurantEditorialEditor } from '@/components/widgets/restaurants/restaurant-editorial-editor';

export const dynamic = "force-dynamic";

export default function NewRestaurantPage() {
  return (
    <RestaurantEditorialEditor mode="create" />
  );
}
