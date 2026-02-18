import React, { useState } from "react";
import { Heart, MessageCircle, User, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([
    {
      id: 1,
      agriturismo: "Agriturismo Il Casale",
      foto: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      didascalia: "Pranzo domenicale con prodotti a km 0! 🌿",
      likes: 24,
      commenti: 5,
      isLiked: false,
    },
    {
      id: 2,
      agriturismo: "Fattoria Verde",
      foto: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80",
      didascalia: "Le nostre verdure fresche raccolte stamattina 🥕",
      likes: 32,
      commenti: 8,
      isLiked: false,
    },
    {
      id: 3,
      agriturismo: "Masseria del Gusto",
      foto: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80",
      didascalia: "Degustazione di formaggi locali 🧀",
      likes: 45,
      commenti: 12,
      isLiked: false,
    },
  ]);

  const handleLike = (postId) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked,
          };
        }
        return post;
      }),
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo e Titolo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                {/* Placeholder per logo futuro */}
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <h1 className="text-2xl font-bold text-green-700">TrustEat</h1>
            </div>

            {/* Icone di navigazione */}
            <div className="flex items-center space-x-4">
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Registrazione Utente Wallet"
              >
                <User className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={() => navigate("/signup/agriturismo")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Registrazione Agriturismo"
              >
                <Store className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Feed dei Post */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Header del Post */}
              <div className="px-4 py-3 flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Store className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {post.agriturismo}
                  </h3>
                </div>
              </div>

              {/* Immagine del Post */}
              <div className="w-full aspect-square bg-gray-200">
                <img
                  src={post.foto}
                  alt={post.didascalia}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Azioni (Like e Commenti) */}
              <div className="px-4 py-3">
                <div className="flex items-center space-x-4 mb-3">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-1 hover:opacity-70 transition-opacity"
                  >
                    <Heart
                      className={`w-6 h-6 ${post.isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`}
                    />
                  </button>
                  <button className="flex items-center space-x-1 hover:opacity-70 transition-opacity">
                    <MessageCircle className="w-6 h-6 text-gray-700" />
                  </button>
                </div>

                {/* Numero di Likes */}
                <p className="font-semibold text-sm mb-2">
                  {post.likes} {post.likes === 1 ? "like" : "likes"}
                </p>

                {/* Didascalia */}
                <div className="text-sm">
                  <span className="font-semibold mr-2">{post.agriturismo}</span>
                  <span className="text-gray-800">{post.didascalia}</span>
                </div>

                {/* Link ai Commenti */}
                {post.commenti > 0 && (
                  <button className="text-sm text-gray-500 mt-2 hover:text-gray-700">
                    Visualizza tutti i {post.commenti} commenti
                  </button>
                )}

                {/* Input per Commento */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <input
                    type="text"
                    placeholder="Aggiungi un commento..."
                    className="w-full text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Messaggio di fine feed */}
        <div className="text-center py-8 text-gray-500">
          <p>Hai visto tutti i post disponibili</p>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
