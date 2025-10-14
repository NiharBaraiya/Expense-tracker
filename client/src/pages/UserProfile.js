import React from "react";

const styles = {
  container: {
    maxWidth: 600,
    margin: "50px auto",
    padding: 20,
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  heading: {
    marginBottom: 20,
    fontSize: "1.8rem",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  loading: {
    padding: 20,
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#555",
  },
  dl: {
    display: "grid",
    gridTemplateColumns: "max-content 1fr",
    rowGap: 10,
    columnGap: 20,
  },
  dt: {
    fontWeight: "600",
    color: "#333",
  },
  dd: {
    margin: 0,
    color: "#666",
    wordBreak: "break-word",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    backgroundColor: "#eee",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 36,
    color: "#bbb",
    userSelect: "none",
    flexShrink: 0,
  },
};

const UserProfile = ({ user }) => {
  if (!user) {
    return (
      <div style={styles.loading} aria-live="polite">
        Loading user profile...
      </div>
    );
  }

  const { username = "", email = "", createdAt, phone, location, bio } = user;

  // Format the date safely
  let formattedDate = "N/A";
  if (createdAt) {
    try {
      const dateObj = new Date(createdAt);
      formattedDate = dateObj.toLocaleDateString();
    } catch {
      formattedDate = createdAt;
    }
  }

  // Generate initials for avatar fallback
  const initials = username
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <section style={styles.container} aria-label="User Profile">
      <div style={styles.heading}>
        <div
          style={styles.avatar}
          role="img"
          aria-label={`User avatar with initials ${initials}`}
        >
          {initials}
        </div><br></br>
        <h2> My Profile</h2>
      </div>

      <dl style={styles.dl}>
        <dt style={styles.dt}>Name:</dt>
        <dd style={styles.dd}>{username || "N/A"}</dd>

        <dt style={styles.dt}>Email:</dt>
        <dd style={styles.dd}>{email || "N/A"}</dd>

        <dt style={styles.dt}>Member since:</dt>
        <dd style={styles.dd}>
          {createdAt ? (
            <time dateTime={new Date(createdAt).toISOString()}>{formattedDate}</time>
          ) : (
            "N/A"
          )}
        </dd>

        <dt style={styles.dt}>Phone:</dt>
        <dd style={styles.dd}>{phone || "N/A"}</dd>

        <dt style={styles.dt}>Location:</dt>
        <dd style={styles.dd}>{location || "N/A"}</dd>

        <dt style={styles.dt}>Bio:</dt>
        <dd style={styles.dd}>{bio || "No bio available."}</dd>
      </dl>
    </section>
  );
};

export default UserProfile;
