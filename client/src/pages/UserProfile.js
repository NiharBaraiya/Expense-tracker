import React, { useEffect, useState } from "react";
import API from "../api";

const LOCAL_PROFILE_KEY = 'userProfile';

const loadLocalProfile = () => {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // fallback from legacy keys
  const username = localStorage.getItem('username') || '';
  const email = localStorage.getItem('email') || '';
  const userId = localStorage.getItem('userId') || '';
  return { userId, username, email, createdAt: new Date().toISOString(), phone: '', location: '', bio: '' };
};

const saveLocalProfile = (profile) => {
  try {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
    if (profile.username) localStorage.setItem('username', profile.username);
    if (profile.email) localStorage.setItem('email', profile.email);
  } catch {}
};

const styles = {
  container: {
    maxWidth: 600,
    margin: "50px auto",
    padding: 20,
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    marginTop: "250px",
    marginBottom: "50px",
    marginRight: "300px",
  },
  heading: {
    marginBottom: 20,
    fontSize: "1.8rem",
    display: "flex",
    alignItems: "center",
    gap: 12,
     backgroundColor: "golden",
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
     backgroundColor: "#f9f9f9",
  },
  dt: {
    fontWeight: "600",
    color: "#333",
  },
  dd: {
    margin: 0,
    color: "#333",
    wordBreak: "break-word",
   
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    backgroundColor: "#007bff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 36,
    color: "#bbb",
    userSelect: "none",
    flexShrink: 0,
  },
// Add this to styles.h1
h1: {
  fontSize: "3rem",
  margin: 0,
  color: "#333",
  // valid golden shade
  padding: "6px 12px",
  borderRadius: "6px",
}

};

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", phone: "", location: "", bio: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await API.get("/user/profile");
        if (mounted) {
          setProfile(res.data);
          setForm({
            username: res.data.username || "",
            email: res.data.email || "",
            phone: res.data.phone || "",
            location: res.data.location || "",
            bio: res.data.bio || "",
          });
        }
      } catch (err) {
        console.warn('No backend connection, using local profile.');
        const local = loadLocalProfile();
        if (mounted) {
          setProfile(local);
          setForm({
            username: local.username || "",
            email: local.email || "",
            phone: local.phone || "",
            location: local.location || "",
            bio: local.bio || "",
          });
          setMessage("Working without server: showing local profile.");
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!profile) {
    return (
      <div style={styles.loading} aria-live="polite">
        Loading user profile...
      </div>
    );
  }

  const { username = "", email = "", createdAt, phone, location, bio } = { ...profile, ...form };

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

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "bio" ? value.slice(0, 500) : value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await API.put("/user/profile", form);
      setProfile(res.data);
      setEdit(false);
      setMessage("✅ Profile updated");
    } catch (err) {
      console.warn('Update failed; saving locally instead.', err);
      const local = { ...profile, ...form };
      if (!local.createdAt) local.createdAt = new Date().toISOString();
      saveLocalProfile(local);
      setProfile(local);
      setEdit(false);
     
    } finally {
      setSaving(false);
    }
  };

  return (
    <section style={styles.container} aria-label="User Profile">
      <div style={styles.heading}>
        <div
          style={styles.avatar}
          aria-label={`User avatar with initials ${initials}`}
        >
          {initials}
        </div><br></br>
        <h1 style={styles.h1}> My Profile</h1>
      </div>

      {edit ? (
        <form onSubmit={onSave} style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', rowGap: 10, columnGap: 20 }}>
          <label style={styles.dt} htmlFor="username">Name:</label>
          <input id="username" name="username" value={form.username} onChange={onChange} required minLength={3} />

          <label style={styles.dt} htmlFor="email">Email:</label>
          <input id="email" name="email" type="email" value={form.email} onChange={onChange} required />

          <label style={styles.dt} htmlFor="phone">Phone:</label>
          <input id="phone" name="phone" value={form.phone} onChange={onChange} />

          <label style={styles.dt} htmlFor="location">Location:</label>
          <input id="location" name="location" value={form.location} onChange={onChange} />

          <label style={styles.dt} htmlFor="bio">Bio:</label>
          <textarea id="bio" name="bio" rows={4} value={form.bio} onChange={onChange} />

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => { setEdit(false); setForm({ username: profile.username || '', email: profile.email || '', phone: profile.phone || '', location: profile.location || '', bio: profile.bio || '' }); }}>Cancel</button>
          </div>
        </form>
      ) : (
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
      )}

      <div style={{ marginTop: 10, color: '#666' }}>{message}</div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => setEdit((v) => !v)}>{edit ? 'Close' : 'Edit Profile'}</button>
      </div>
    </section>
  );
};

export default UserProfile;
