export default function FloatingButtons() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi! I found your website TheGoanWedding.com and would like to know more about your services.");
    window.open(`https://wa.me/919769661682?text=${message}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = "tel:+919769661682";
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      <button
        onClick={handleWhatsApp}
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg animate-float transition-all transform hover:scale-110"
        aria-label="Contact via WhatsApp"
      >
        <i className="fab fa-whatsapp text-xl"></i>
      </button>
      <button
        onClick={handleCall}
        className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg animate-float transition-all transform hover:scale-110"
        style={{ animationDelay: '0.5s' }}
        aria-label="Call us"
      >
        <i className="fas fa-phone text-xl"></i>
      </button>
    </div>
  );
}
