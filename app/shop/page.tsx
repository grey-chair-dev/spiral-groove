import ProductGrid from "@/components/ProductGrid";
import Filters from "@/components/Filters";

export default function ShopPage() {
  return (
    <div className="section">
      <h1 className="text-3xl font-semibold mb-4">Shop</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <Filters />
        </aside>
        <div className="lg:col-span-3">
          <ProductGrid />
        </div>
      </div>
    </div>
  );
}
