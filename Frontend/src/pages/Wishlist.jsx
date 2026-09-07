import { Heart } from "lucide-react";

function Wishlist() {
  return (
    <div className="user-home">

      <section className="quick-section">

        <div className="section-heading">
          <p>MY WISHLIST</p>
          <h2>Favorite Destinations ❤️</h2>
        </div>

        <div className="empty-state">
          <div className="empty-icon">
            ❤️
          </div>

          <h3>Your wishlist is empty</h3>

          <p>
            Add your favorite travel packages to see them here.
          </p>

          <a
            href="/packages"
            className="primary-btn"
            style={{ marginTop: "20px" }}
          >
            Explore Packages
          </a>
        </div>

      </section>

    </div>
  );
}

export default Wishlist;