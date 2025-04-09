import React from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export type FilterOptions = {
  categories: string[];
  priceRange: [number, number];
  availability: boolean;
};

type SearchFiltersProps = {
  allCategories: string[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  minPrice: number;
  maxPrice: number;
};

const SearchFilters: React.FC<SearchFiltersProps> = ({
  allCategories,
  filters,
  onFilterChange,
  onClearFilters,
  minPrice,
  maxPrice,
}) => {
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    
    onFilterChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handlePriceChange = (value: number[]) => {
    onFilterChange({
      ...filters,
      priceRange: [value[0], value[1]],
    });
  };

  const handleAvailabilityChange = (checked: boolean) => {
    onFilterChange({
      ...filters,
      availability: checked,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearFilters}
          className="h-8 px-2 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Clear all
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={['categories', 'price']}>
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              {allCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category, checked === true)
                    }
                  />
                  <Label 
                    htmlFor={`category-${category}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2 px-1">
              <Slider
                defaultValue={[filters.priceRange[0], filters.priceRange[1]]}
                max={maxPrice}
                min={minPrice}
                step={1}
                value={[filters.priceRange[0], filters.priceRange[1]]}
                onValueChange={handlePriceChange}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm">${filters.priceRange[0]}</span>
                <span className="text-sm">${filters.priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="in-stock"
                checked={filters.availability}
                onCheckedChange={(checked) => 
                  handleAvailabilityChange(checked === true)
                }
              />
              <Label 
                htmlFor="in-stock"
                className="text-sm font-normal cursor-pointer"
              >
                In stock only
              </Label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default SearchFilters;