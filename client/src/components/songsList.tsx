import { useNavigate, useParams } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import "../styles/songsList.css";
import { AuthContext } from "../auth/auth-context";

function SongList() {
  const navigate = useNavigate();
const auth = useContext(AuthContext);
type Notification = {
  id: number;
  message: string;
  date: string;
  status: "pending" | "read";
};
type Notifications ={
  id:number
  isRead:boolean
  message:string
  createdAt:string
  songId:number
}
 type Song ={
  Id: number;
  albumId: number | null;
  artistId: number | null;
  audioFileUrl: string | null;
  language: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  Category: string;
  LyricsContents: LyricsContent[];
  Artist:Artist
}

interface LyricsContent {
  Id: number;
  lyricsId: number;
  languageKey: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedAt: string | null;
  title: string;
  chorus: string | null;
  verse1: string | null;
  verse2: string | null;
  verse3: string | null;
  verse4: string | null;
  verse5: string | null;
  verse6: string | null;
  approvedById: number | null;
}
interface Artist {
  Id: number,
  name: string,
  genre: string,
  bio: string,
  imageUrl: string,
  createdAt: string,
  deletedAt: string
}
    const [open, setOpen] = useState(false);
  // if (!auth?.user || auth.user.role === "GUEST") return null;
  const [selectedLang, setSelectedLang] = useState("");
  const [selectedArtist, setSelectedArtist] = useState("");
  const [notification, setNotifications] = useState<Notifications[]>([]);
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<Song[]>([]);
    const [song, setSong] = useState<Song[]>([]);
     const languages = [...new Set(songs.map(song => song.language))];
  const artists = [...new Set(songs.map(song => song.Artist?.name).filter(Boolean))];
  // Dashboard stats
  const songIcons = {
     songIcon:'🎵',
     artistIcon:'👤',
     albumIcon:'💿'
  }
  // Filter logic
 const filteredSongs = songs.filter(song => {
  return (
    (selectedLang === "" || song.language === selectedLang) &&
    (selectedArtist === "" || song.Artist?.name === selectedArtist)
  );
});

  // Create dropdown lsts
  const { songId } = useParams<{ songId: string }>();
  const handleToggleStatus = async (id: number) => {
     try {
    const res = await fetch(`https://sda-songs-be.onrender.com/lyrics/${id}/toggle`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth?.token}`
      },
    });

    const updatedSong = await res.json();

    // update userinter face 
    setSongs(prev =>
      prev.map(song =>
        song.Id === id ? updatedSong : song
      )
    );
  } catch (err) {
    console.error("Error toggling song:", err);
  }
  };
  const handleViewDetails = (songId:number) =>{
    navigate(`/lyrics/${songId}`)
  }
  
  useEffect(() => {
  const getNotifications = async () => {
    try {
      const res = await fetch("https://sda-songs-be.onrender.com/notifications", {
        headers: {
          Authorization: `Bearer ${auth?.token}`
        }
      });

      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const getSongs = async () => {
    try {
      const res = await fetch("https://sda-songs-be.onrender.com/lyrics", {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });

      const data = await res.json();
      setSongs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
   const fetchSong = async () => {
    try {
      const res = await fetch(`https://sda-songs-be.onrender.com/lyrics/${songId}`, {
        headers: { Authorization: `Bearer ${auth?.token}` }
      });
       const data = await res.json();
       console.log("song id", data)
      setSong(data);
    } catch (err) {
      console.error(err);
    }
  };
  
  getNotifications();
  getSongs();
  fetchSong()
}, [auth?.token]);
const activeSongs = songs.filter(song => song.deletedAt === null);
const pendingSongsCount = activeSongs.reduce((count, song) => {
  const pendingLyrics = song.LyricsContents.filter(lc => lc.status === "PENDING");
  return count + pendingLyrics.length;
}, 0);
const uniqueArtists = new Set(activeSongs.map(song => song.Artist?.Id)).size;
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">🎵 Songs Dashboard</h1>
      {/* Buttons */}
      <div className="button-group">
        <button className="add-button" onClick={() => navigate("/addArtist")}>
          ➕ Add Artist
        </button>
        <button className="add-button" onClick={() => navigate("/addLyrics")}>
          ➕ Add Lyrics
        </button>
        <button className="add-button" onClick={() => navigate("/addAlbum")}>
          ➕ Add Album
        </button>
      {auth?.user && auth.user.role ==="SUPER_ADMIN" && (
        <button className="notification-btn"
           onClick={() => setOpen(!open)}
        >
           Actions Required ({activeSongs.filter(x =>x.LyricsContents[0].status ==="PENDING").length})
      <span style={{ marginLeft: "0.5rem" }}>▼</span>
        </button>
        
      )}
      {open && (
        <ul
          style={{
            position: "absolute",
            top: "10%",
            right: 540,
            width: "250px",
            maxHeight: "300px",
            overflowY: "auto",
            backgroundColor: "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            borderRadius: "8px",
            zIndex: 1000,
            padding: 0,
            margin: 0
          }}
        >
          {activeSongs.filter(x => x.LyricsContents[0].status === "PENDING").length === 0 && (
            <p style={{ padding: "1rem" }}>No notifications</p>
          )}
        <p style={{
                  padding: "0.8rem 1rem",
                  borderBottom: "1px solid #eee",
                  backgroundColor: "#cfbc7bff",
                  fontSize:20
                }}>Actions Required: </p>
          {activeSongs
            .filter(x => x.LyricsContents[0].status === "PENDING")
            .map(song => (
              <li
                key={song.Id}
                style={{
                  padding: "0.8rem 1rem",
                  borderBottom: "1px solid #eee",
                  backgroundColor: "#fff3cd"
                }}
              >
              
                <p><strong>Language: </strong>{song.language} </p>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  <strong>Title: </strong>{song.LyricsContents[0].title}
                </p>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  <strong>Added At: </strong>{song.createdAt}
                </p>
                <button className="notification-view-btn" onClick={() => handleViewDetails(song.Id)}>
                  View details
                </button>
                <hr/>
              </li>
            ))}
        </ul>
)}
         {auth?.token && (
        <button className="logout-btn" onClick={() => auth.logout()}>Logout</button>
      )}

      </div>
      {}
      <div className="dashboard-grid">
     
          <div  className="dashboard-card">
            <div className="card-icon">{songIcons.songIcon}</div>
            <div className="card-info">
              <h2>{activeSongs.length}</h2>
              <p>Active songs</p>
            </div>
          </div>
          <div  className="dashboard-card">
            <div className="card-icon">{songIcons.songIcon}</div>
            <div className="card-info">
              <h2>{pendingSongsCount }</h2>
              <p>Pending approval</p>
            </div>
          </div>
          <div  className="dashboard-card">
            <div className="card-icon">{songIcons.artistIcon}</div>
            <div className="card-info">
              <h2>{uniqueArtists }</h2>
              <p>Unique Artits</p>
            </div>
          </div>
      </div>
      {/* Filters */}
      <div className="filters-container">
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="filter-input"
        >
          <option value="">Filter by Language</option>
          {languages.map((lang, i) => (
            <option key={i} value={lang}>{lang}</option>
          ))}
        </select>

         <select
          value={selectedArtist}
          onChange={(e) => setSelectedArtist(e.target.value)}
          className="filter-input"
        >
          <option value="">Filter by Artist</option>
          {artists.map((artist, i) => (
            <option key={i} value={artist}>{artist}</option>
          ))}
        </select> 
      </div>
      {/* Lyrics contents  Table */}
      <table className="songs-table">
        <thead>
          <tr>
            <th>#Id</th>
            <th>Song Title</th>
            <th>Artist</th>
            <th>Category</th>
            <th>Language</th>
            <th>Created At</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredSongs.map(song => (
            <tr
              key={song.Id}
              className={song.deletedAt ? "deactivated-row" : ""}
            >
              <td>{song.Id}</td>
              <td>{song.LyricsContents[0].title}</td>
             <td>{song.Artist?.name || "N/A"}</td>

              <td>{song.Category}</td>
              <td>{song.language}</td>
              <td>{song.updatedAt}</td>
              <td>{song.createdAt ? "Inactive" : "Active"}</td>
              <td className="actions-cell">
                {!song.deletedAt && (
                  <>
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/editSong/${song.Id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="deactivate-btn"
                      onClick={() => handleToggleStatus(song.Id)}
                    >
                      Deactivate
                    </button>
                  </>
                )}

                {song.deletedAt && (
                  <button
                    className="activate-btn"
                    onClick={() => handleToggleStatus(song.Id)}
                  >
                    Activate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default SongList;