// components/BatchCard.jsx
export default function BatchCard({
    role,
    name,
    location,
    contact,
    price,
    timestamp,
  }) {
    return (
      <div className="bg-card border border-accent/30 rounded-lg p-5 shadow-sm space-y-1">
        <h3 className="text-accent font-semibold text-lg">{role}</h3>
  
        <p>
          <span className="opacity-70">Name:</span> {name}
        </p>
        <p>
          <span className="opacity-70">Location:</span> {location}
        </p>
        <p>
          <span className="opacity-70">Contact:</span> {contact}
        </p>
        <p>
          <span className="opacity-70">Price:</span> {price}
        </p>
        <p>
          <span className="opacity-70">Timestamp:</span> {timestamp}
        </p>
      </div>
    );
  }
  