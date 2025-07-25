import CategoryGrid from "@/components/CategoryGrid";
import IconTest from "@/components/IconTest";

export default function Categories() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <p className="wedding-script text-xl md:text-2xl text-red-500 mb-4">
            Complete Collection
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
            Browse All Categories
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-teal-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our handpicked collection of Goa's most talented wedding professionals. 
            Each category features verified vendors who specialize in creating magical moments.
          </p>
        </div>
        
        {/* Debug component to test icon imports */}
        <div className="mb-8">
          <IconTest />
        </div>
        
        <CategoryGrid showAll={true} />
      </div>
    </div>
  );
}