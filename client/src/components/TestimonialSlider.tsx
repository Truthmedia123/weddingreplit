import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const testimonials = [
  {
    id: 1,
    name: "Priya & Arjun",
    year: "2023",
    rating: 5,
    comment: "TheGoanWedding.com made our dream beach wedding a reality. We found the perfect photographer and venue through their platform. The cultural touch they add makes all the difference!",
    image: "https://images.unsplash.com/photo-1537511446984-935f663eb1f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    id: 2,
    name: "Maria & Carlos",
    year: "2023", 
    rating: 5,
    comment: "The vendors recommended through this platform were exceptional. Our caterer delivered authentic Goan flavors that our guests are still talking about months later!",
    image: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    id: 3,
    name: "Rohan & Kavya",
    year: "2024",
    rating: 5,
    comment: "Planning our destination wedding from Mumbai was stressful until we found TheGoanWedding.com. Everything was seamlessly coordinated. Highly recommended!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  }
];

export default function TestimonialSlider() {
  return (
    <section className="py-24 bg-gradient-to-br from-red-50 via-white to-teal-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 cultural-pattern opacity-40"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200 rounded-full opacity-20 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-20">
          <p className="wedding-script text-2xl text-red-500 mb-4">
            Love Stories
          </p>
          <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
            Happy Couples Testimonials
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-teal-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Hear from couples who trusted us with their special day. Their joy and satisfaction 
            inspire us to continue connecting hearts with perfect wedding vendors.
          </p>
        </div>
        
        <Carousel className="w-full max-w-6xl mx-auto">
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="bg-white/90 backdrop-blur-lg shadow-2xl h-full border-0 overflow-hidden group hover:shadow-3xl transition-all duration-500">
                  <CardContent className="p-8 relative">
                    {/* Quote decoration */}
                    <div className="absolute top-4 left-4 text-6xl text-red-100 font-serif leading-none">"</div>
                    
                    {/* Rating stars */}
                    <div className="flex justify-center mb-6 mt-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <i key={i} className="fas fa-star text-yellow-400 text-lg mx-0.5"></i>
                      ))}
                    </div>
                    
                    {/* Testimonial content */}
                    <p className="text-gray-700 mb-8 italic text-center leading-relaxed relative z-10">
                      "{testimonial.comment}"
                    </p>
                    
                    {/* Author info */}
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg" 
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <i className="fas fa-heart text-white text-xs"></i>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg wedding-script">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">Married in Goa • {testimonial.year}</p>
                      </div>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <i className="fas fa-rings-wedding text-4xl text-red-500"></i>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Custom navigation */}
          <div className="flex justify-center mt-12 gap-4">
            <CarouselPrevious className="relative translate-y-0 left-0 bg-white/90 hover:bg-white border-2 border-red-200 hover:border-red-400 text-red-500 w-12 h-12 shadow-lg" />
            <CarouselNext className="relative translate-y-0 right-0 bg-white/90 hover:bg-white border-2 border-red-200 hover:border-red-400 text-red-500 w-12 h-12 shadow-lg" />
          </div>
        </Carousel>
        
        {/* Call to action */}
        <div className="text-center mt-16">
          <Link href="/contact">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-xl">
              <i className="fas fa-heart"></i>
              <span>Share Your Story</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
