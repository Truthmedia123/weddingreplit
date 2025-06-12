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
    <section className="py-20 bg-gradient-to-br from-teal-50 to-red-50 cultural-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Happy Couples Share Their Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real experiences from couples who found their perfect vendors through TheGoanWedding.com
          </p>
        </div>
        
        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl h-full">
                  <CardContent className="p-8">
                    <div className="flex text-yellow-500 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <i key={i} className="fas fa-star"></i>
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 italic">"{testimonial.comment}"</p>
                    <div className="flex items-center">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover mr-4" 
                      />
                      <div>
                        <h4 className="font-semibold text-slate-800">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500">Married in Goa, {testimonial.year}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
