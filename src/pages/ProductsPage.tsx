import { useState, useEffect } from 'react';
import type { Product } from '../types';
import { api } from '../services/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../components/ui/select';
import { Plus, LayoutGrid, List, X, UploadCloud, CheckCircle2 } from 'lucide-react';

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Equipment');
  const [stock, setStock] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadProducts = async () => {
    const prods = await api.getProducts();
    setProducts(prods);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku('');
    setPrice('');
    setCategory('Equipment');
    setStock('');
    setReorderLevel('');
    setDescription('');
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSku(prod.sku);
    setPrice(prod.price.toString());
    setCategory(prod.category);
    setStock(prod.stock.toString());
    setReorderLevel(prod.reorderLevel.toString());
    setDescription(prod.description);
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) errs.name = 'Product name is required';
    if (!sku.trim()) errs.sku = 'SKU is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      errs.price = 'Valid positive price required';
    }
    if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) {
      errs.stock = 'Valid stock quantity required';
    }
    if (reorderLevel === '' || isNaN(Number(reorderLevel)) || Number(reorderLevel) < 0) {
      errs.reorderLevel = 'Valid reorder level required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const prodPayload = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      price: parseFloat(price),
      category,
      stock: parseInt(stock, 10),
      reorderLevel: parseInt(reorderLevel, 10),
      description: description.trim(),
    };

    if (editingProduct) {
      await api.updateProduct(editingProduct.id, prodPayload);
      setToastMessage(`Product "${name}" updated successfully!`);
    } else {
      await api.createProduct(prodPayload);
      setToastMessage(`Product "${name}" added successfully!`);
    }

    setIsModalOpen(false);
    await loadProducts();
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-[#bfe5d1] bg-[#d9f0e3] p-3 text-xs font-medium text-[#2e8b57]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#14302b]">Products</h2>
          <p className="text-xs text-[#6b7f7a]">
            Manage catalog, inventory thresholds, and item pricing.
          </p>
        </div>

        <Button
          variant="accent"
          onClick={handleOpenAddModal}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Add product</span>
        </Button>
      </div>

      {/* Filter and View toggle bar */}
      <div className="flex items-center justify-between border-b border-[#dde4e2] pb-3 text-xs">
        <div className="flex items-center gap-2">
          {/* Grid / List button group */}
          <div className="flex rounded-lg border border-[#dde4e2] bg-white p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${viewMode === 'grid'
                  ? 'bg-[#e4f0ed] font-semibold text-[#0f6b5c]'
                  : 'text-[#6b7f7a] hover:text-[#14302b]'
                }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${viewMode === 'list'
                  ? 'bg-[#e4f0ed] font-semibold text-[#0f6b5c]'
                  : 'text-[#6b7f7a] hover:text-[#14302b]'
                }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>

          <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val)}>
            <SelectTrigger className="w-auto h-8 gap-2 bg-white border-[#dde4e2]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Category: All</SelectItem>
              <SelectItem value="Equipment">Category: Equipment</SelectItem>
              <SelectItem value="Consumables">Category: Consumables</SelectItem>
              <SelectItem value="Accessories">Category: Accessories</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span className="text-xs text-[#6b7f7a]">{filteredProducts.length} items</span>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((p) => {
            const isLowStock = p.stock <= p.reorderLevel;
            return (
              <Card
                key={p.id}
                onClick={() => handleOpenEditModal(p)}
                className="group cursor-pointer p-3.5 transition-all hover:shadow-xs active:scale-98"
              >
                {/* Product Image placeholder matching mockups */}
                <div className="flex h-24 w-full items-center justify-center rounded-lg bg-[#e4f0ed] text-[#0f6b5c] transition-colors group-hover:bg-[#d6eae5]">
                  <span className="text-xs font-semibold opacity-70">{p.sku}</span>
                </div>

                <div className="mt-3">
                  <h4 className="truncate text-xs font-bold text-[#14302b]">{p.name}</h4>
                  <p className="mt-0.5 text-xs font-medium text-[#14302b]">
                    ${p.price.toFixed(2)}
                  </p>
                  <p
                    className={`mt-1 text-[11px] font-medium ${isLowStock ? 'font-bold text-[#c8442f]' : 'text-[#6b7f7a]'
                      }`}
                  >
                    Stock {p.stock} {isLowStock && '• Low'}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#dde4e2] text-[#6b7f7a]">
                <th className="py-2.5 pl-4">Product</th>
                <th className="px-3 py-2.5">SKU</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Price</th>
                <th className="py-2.5 pr-4 text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde4e2]">
              {filteredProducts.map((p) => {
                const isLowStock = p.stock <= p.reorderLevel;
                return (
                  <tr
                    key={p.id}
                    onClick={() => handleOpenEditModal(p)}
                    className="cursor-pointer hover:bg-[#f9fbfa]"
                  >
                    <td className="py-3 pl-4 font-semibold text-[#14302b]">{p.name}</td>
                    <td className="px-3 py-3 text-[#6b7f7a]">{p.sku}</td>
                    <td className="px-3 py-3 text-[#6b7f7a]">{p.category}</td>
                    <td className="px-3 py-3 font-medium text-[#14302b]">${p.price.toFixed(2)}</td>
                    <td
                      className={`py-3 pr-4 text-right font-medium ${isLowStock ? 'font-bold text-[#c8442f]' : 'text-[#14302b]'
                        }`}
                    >
                      {p.stock}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <p className="text-xs text-[#6b7f7a]">
        Cards show an image, price, and stock. Low stock turns red.
      </p>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-[#dde4e2] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#dde4e2] pb-4">
              <h3 className="text-base font-bold text-[#14302b]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-[#6b7f7a] hover:bg-[#e4f0ed]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6b7f7a] mb-1">Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Hand Grinder"
                    className={`w-full rounded-lg border p-2 text-xs focus:outline-hidden ${errors.name ? 'border-[#c8442f] bg-[#f8dfda]/20' : 'border-[#dde4e2] bg-[#fbfcfc]'
                      }`}
                  />
                  {errors.name && <span className="text-[11px] text-[#c8442f]">{errors.name}</span>}
                </div>

                <div>
                  <label className="block text-[#6b7f7a] mb-1">SKU *</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. HG-110"
                    className={`w-full rounded-lg border p-2 text-xs focus:outline-hidden ${errors.sku ? 'border-[#c8442f] bg-[#f8dfda]/20' : 'border-[#dde4e2] bg-[#fbfcfc]'
                      }`}
                  />
                  {errors.sku && <span className="text-[11px] text-[#c8442f]">{errors.sku}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6b7f7a] mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="42.00"
                    className={`w-full rounded-lg border p-2 text-xs focus:outline-hidden ${errors.price ? 'border-[#c8442f] bg-[#f8dfda]/20' : 'border-[#dde4e2] bg-[#fbfcfc]'
                      }`}
                  />
                  {errors.price && <span className="text-[11px] text-[#c8442f]">{errors.price}</span>}
                </div>

                <div>
                  <label className="block text-[#6b7f7a] mb-1">Category</label>
                  <Select value={category} onValueChange={(val) => setCategory(val)}>
                    <SelectTrigger className="w-full h-9 rounded-lg bg-[#fbfcfc] border-[#dde4e2]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Consumables">Consumables</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#6b7f7a] mb-1">Stock *</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="7"
                    className={`w-full rounded-lg border p-2 text-xs focus:outline-hidden ${errors.stock ? 'border-[#c8442f] bg-[#f8dfda]/20' : 'border-[#dde4e2] bg-[#fbfcfc]'
                      }`}
                  />
                  {errors.stock && <span className="text-[11px] text-[#c8442f]">{errors.stock}</span>}
                </div>

                <div>
                  <label className="block text-[#6b7f7a] mb-1">Reorder Level *</label>
                  <input
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    placeholder="10"
                    className={`w-full rounded-lg border p-2 text-xs focus:outline-hidden ${errors.reorderLevel
                        ? 'border-[#c8442f] bg-[#f8dfda]/20'
                        : 'border-[#dde4e2] bg-[#fbfcfc]'
                      }`}
                  />
                  {errors.reorderLevel && (
                    <span className="text-[11px] text-[#c8442f]">{errors.reorderLevel}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[#6b7f7a] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Burr grinder, 30 settings, steel body..."
                  className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2 text-xs focus:outline-hidden"
                />
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-[#6b7f7a] mb-1">Image</label>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#dde4e2] bg-[#fbfcfc] p-4 text-center hover:border-[#0f6b5c]">
                  <UploadCloud className="h-6 w-6 text-[#6b7f7a]" />
                  <p className="mt-1 text-xs text-[#14302b]">Drop a file or click to upload</p>
                  <span className="text-[10px] text-[#6b7f7a]">PNG, JPG, WEBP up to 5MB</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#dde4e2]">
                <span className="text-[11px] text-[#6b7f7a]">Required fields show inline errors.</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-[#dde4e2] px-3.5 py-2 text-xs font-semibold text-[#6b7f7a] hover:bg-[#f3f5f4]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#f2a33a] px-4 py-2 text-xs font-semibold text-[#2b1c00] hover:bg-[#e39328]"
                  >
                    Save product
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
