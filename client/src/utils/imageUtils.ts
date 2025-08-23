// High-quality wedding images from Unsplash with proper fallbacks
export const getDefaultImageForCategory = (category: string): string => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('photo')) {
    return "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80";
  } else if (categoryLower.includes('catering') || categoryLower.includes('food')) {
    return "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80";
  } else if (categoryLower.includes('floral') || categoryLower.includes('flower')) {
    return "https://images.unsplash.com/photo-1478146896981-b80fe463b330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80";
  } else if (categoryLower.includes('makeup') || categoryLower.includes('beauty')) {
    return "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80";
  } else if (categoryLower.includes('music') || categoryLower.includes('dj') || categoryLower.includes('band')) {
    return "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80";
  } else if (categoryLower.includes('planner') || categoryLower.includes('coordinator')) {
    return "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80";
  } else {
    // Default wedding image
    return "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80";
  }
};

export const getBlogImageForPost = (postId?: number): string => {
  const blogImages = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80"
  ];
  
  const id = postId ?? 0;
  return blogImages[id % blogImages.length] || blogImages[0] || '';
};