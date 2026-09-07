
import { useRef } from "react";

import {
  MapPin,
  CalendarCheck,
  Heart,
  ArrowRight,
  Plane,
  Bus,
  Car,
  Train,
  Bike,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "./UserHome.css";

function UserHome() {
  const travelRef = useRef(null);
  const destinationRef = useRef(null);

  const scrollTravel = (direction) => {
    if (travelRef.current) {
      travelRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  const scrollDestinations = (direction) => {
    if (destinationRef.current) {
      destinationRef.current.scrollBy({
        left: direction === "left" ? -340 : 340,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="user-home">

      {/* ================= HERO ================= */}

      <section className="user-hero">

        <img
          src="/images/travel-hero.jpg"
          alt="Travel adventure"
          className="hero-image"
        />

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <span className="hero-badge">
            ✈️ Explore the world with TravelMate
          </span>

          <h1>
            Welcome back 👋
            <br />
            <span>Plan your next adventure.</span>
          </h1>

          <p>
            Discover beautiful destinations, explore exciting
            travel packages, and create unforgettable memories.
          </p>

          <div className="hero-buttons">

            <a href="/packages" className="primary-btn">
              Explore Packages
              <ArrowRight size={18} />
            </a>

            <a href="/my-bookings" className="secondary-btn">
              My Bookings
            </a>

          </div>

        </div>
      </section>


      {/* ================= TRAVEL OPTIONS ================= */}

      <section className="travel-section">

        <div className="section-heading">
          <p>TRAVEL YOUR WAY</p>
          <h2>Choose how you want to travel</h2>
        </div>

        <div className="carousel-wrapper">

          <button
            className="carousel-arrow left-arrow"
            onClick={() => scrollTravel("left")}
            aria-label="Previous travel option"
          >
            <ChevronLeft size={22} />
          </button>

          <div
            className="travel-scroll"
            ref={travelRef}
          >

            {/* BUS */}
            <div className="travel-card">

              <img
                src="/images/bus.jpg"
                alt="Bus travel"
              />

              <div className="travel-card-info">
                <div className="travel-icon">
                  <Bus size={24} />
                </div>

                <h3>Bus</h3>
                <p>Comfortable road journeys</p>
              </div>

            </div>


            {/* CAR */}
            <div className="travel-card">

              <img
                src="/images/car.jpg"
                alt="Car travel"
              />

              <div className="travel-card-info">
                <div className="travel-icon">
                  <Car size={24} />
                </div>

                <h3>Car</h3>
                <p>Flexible road trips</p>
              </div>

            </div>


            {/* FLIGHT */}
            <div className="travel-card">

              <img
                src="/images/flight.jpg"
                alt="Flight travel"
              />

              <div className="travel-card-info">
                <div className="travel-icon">
                  <Plane size={24} />
                </div>

                <h3>Flight</h3>
                <p>Fly to your destination</p>
              </div>

            </div>


            {/* TRAIN */}
            <div className="travel-card">

              <img
                src="/images/train.jpg"
                alt="Train travel"
              />

              <div className="travel-card-info">
                <div className="travel-icon">
                  <Train size={24} />
                </div>

                <h3>Train</h3>
                <p>Relax and enjoy the journey</p>
              </div>

            </div>


            {/* BIKE */}
            <div className="travel-card">

              <img
                src="/images/bike.jpg"
                alt="Bike travel"
              />

              <div className="travel-card-info">
                <div className="travel-icon">
                  <Bike size={24} />
                </div>

                <h3>Bike</h3>
                <p>Adventure on every road</p>
              </div>

            </div>

          </div>

          <button
            className="carousel-arrow right-arrow"
            onClick={() => scrollTravel("right")}
            aria-label="Next travel option"
          >
            <ChevronRight size={22} />
          </button>

        </div>

      </section>


      {/* ================= DESTINATIONS ================= */}

      <section className="destination-section">

        <div className="section-heading">

          <p>POPULAR DESTINATIONS</p>

          <h2>
            Where will you go next?
          </h2>

        </div>


        <div className="carousel-wrapper">

          <button
            className="carousel-arrow left-arrow"
            onClick={() => scrollDestinations("left")}
            aria-label="Previous destination"
          >
            <ChevronLeft size={22} />
          </button>


          <div
            className="destination-scroll"
            ref={destinationRef}
          >

            {/* GOA */}

            <div className="destination-card">

              <img
                src="/images/goa.jpg"
                alt="Goa"
              />

              <div className="destination-overlay"></div>

              <div className="destination-info">

                <span>📍 India</span>

                <h3>Goa</h3>

                <p>
                  Beaches • Fun • Adventure
                </p>

              </div>

            </div>


            {/* KERALA */}

            <div className="destination-card">

              <img
                src="/images/kerala.jpg"
                alt="Kerala"
              />

              <div className="destination-overlay"></div>

              <div className="destination-info">

                <span>📍 India</span>

                <h3>Kerala</h3>

                <p>
                  Nature • Backwaters • Culture
                </p>

              </div>

            </div>


            {/* MANALI */}

            <div className="destination-card">

              <img
                src="/images/manali.jpg"
                alt="Manali"
              />

              <div className="destination-overlay"></div>

              <div className="destination-info">

                <span>📍 India</span>

                <h3>Manali</h3>

                <p>
                  Mountains • Snow • Adventure
                </p>

              </div>

            </div>


            {/* ARAKU */}

            <div className="destination-card">

              <img
                src="/images/araku-vally.jpg"
                alt="Araku Valley"
              />

              <div className="destination-overlay"></div>

              <div className="destination-info">

                <span>📍 Andhra Pradesh</span>

                <h3>Araku Valley</h3>

                <p>
                  Hills • Nature • Coffee
                </p>

              </div>

            </div>


            {/* OOTY */}

            <div className="destination-card">

              <img
                src="/images/ooty.jpg"
                alt="Ooty"
              />

              <div className="destination-overlay"></div>

              <div className="destination-info">

                <span>📍 Tamil Nadu</span>

                <h3>Ooty</h3>

                <p>
                  Hills • Greenery • Peace
                </p>

              </div>

            </div>


            {/* JAIPUR */}

            <div className="destination-card">

              <img
                src="/images/jaipur.jpg"
                alt="Jaipur"
              />

              <div className="destination-overlay"></div>

              <div className="destination-info">

                <span>📍 Rajasthan</span>

                <h3>Jaipur</h3>

                <p>
                  Heritage • Culture • Royalty
                </p>

              </div>

            </div>

          </div>


          <button
            className="carousel-arrow right-arrow"
            onClick={() => scrollDestinations("right")}
            aria-label="Next destination"
          >
            <ChevronRight size={22} />
          </button>

        </div>

      </section>


      {/* ================= QUICK ACCESS ================= */}

      <section className="quick-section">

        <div className="section-heading">

          <p>QUICK ACCESS</p>

          <h2>
            What would you like to do?
          </h2>

        </div>


        <div className="user-cards">

          {/* PACKAGES */}

          <a
            href="/packages"
            className="user-card"
          >

            <div className="card-icon">
              <MapPin size={28} />
            </div>

            <h3>
              Explore Packages
            </h3>

            <p>
              Discover exciting destinations
              and travel packages.
            </p>

            <span>
              Explore
              <ArrowRight size={16} />
            </span>

          </a>


          {/* BOOKINGS */}

          <a
            href="/my-bookings"
            className="user-card"
          >

            <div className="card-icon">
              <CalendarCheck size={28} />
            </div>

            <h3>
              My Bookings
            </h3>

            <p>
              View your upcoming and previous
              travel bookings.
            </p>

            <span>
              View Bookings
              <ArrowRight size={16} />
            </span>

          </a>


          {/* WISHLIST */}

          <a
            href="/wishlist"
            className="user-card"
          >

            <div className="card-icon">
              <Heart size={28} />
            </div>

            <h3>
              Wishlist
            </h3>

            <p>
              Keep your favorite destinations
              in one place.
            </p>

            <span>
              View Wishlist
              <ArrowRight size={16} />
            </span>

          </a>

        </div>

      </section>

    </div>
  );
}

export default UserHome;

