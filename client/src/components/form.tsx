import React, { useEffect, useState } from "react";
import "./form.css";
import CATEGORIES from "../constants/Categories"

import LyricsContent from "../constants/LyricsContent";
import axios from "axios"
import LANGUAGES from "../constants/languages";
import LANGUAGE_MAP from "../config/language";
type CreateLyricsForm = {
  albumId: number | "";
  artistId: number | "";
  audioFileUrl: string;
  language: string;
  category: string;
  contents: LyricsContent[];
};
type Artist = {
  Id:number,
  name:string,
  genre:string,
  imageUrl:string;
  createdAt:string,
  deletedAt:string,
  languageKey:string,
}
type Album ={
  Id:number,
  title: string,
  artistId: number | "",
  releaseDate: string,
  coverImageUrl: string
}

const SongForm =  () => {
  const [artists, setArtists] = useState<Artist[]>([])
  const [albums, setAlbums] = useState<Album[]>([]);
  const [formData, setFormData] = useState<CreateLyricsForm>({
    language: "",
    artistId: 0,
    albumId:0,
    audioFileUrl:'',
    category: "",
    contents:[
                {
                    title:'', 
                    chorus:'',
                    verse1:'',
                    verse2:'',
                    verse3:'',
                    verse4:'',
                    verse5:'',
                    verse6:'',
                }
    ],
  });
useEffect(() =>{
   axios
   
         .get("https://sda-songs-be.onrender.com/artists")
         .then((res) =>setArtists(res.data))
         .catch((err) =>console.error(err))
    axios
          .get("https://sda-songs-be.onrender.com/albums")
          .then((res) =>setAlbums(res.data))
          .catch((err) =>console.error(err))
},[])
const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  index?: number,
  field?: keyof LyricsContent
) => {
  const { name, value, type, files } = e.target as HTMLInputElement;

  // Update lyrics content if index and field are provided
  if (index !== undefined && field) {
    setFormData(prev => {
      const updatedContents = [...prev.contents];
      updatedContents[index] = {
        ...updatedContents[index],
        [field]: value,
      };
      return { ...prev, contents: updatedContents };
    });
  } else {
    // Handle file input
    if (name === "language") {
  setFormData(prev => ({
    ...prev,
    language: value,
    artistId: 0,   // reset artist
    albumId: 0     // reset album too
  }));
  return;
}
    else if (type === "file" && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          audioFileUrl: reader.result as string, // base64 string
        }));
      };
      reader.readAsDataURL(file);
    } 
    else {
      // Update top-level non-file fields
      setFormData(prev => ({
        ...prev,
        [name]: name === "artistId" || name === "albumId" ? Number(value) : value,
      }));
    }
  }
};


  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitted:", formData);
  
  if(!formData.albumId || !formData.artistId || !formData.language || !formData.category) {
    alert("Please fill all required fields")
    return
  }
  if (formData.albumId === 0 || formData.artistId === 0 || !formData.language || !formData.category || !formData.contents[0].title) {
  alert("Please fill all required fields including the song title.");
  return;
}
  try{
    const payload ={
      ...formData, 
      artistId:Number(formData.artistId),
      albumId:Number(formData.albumId)
    }
  
  const response = await axios.post("https://sda-songs-be.onrender.com/lyrics", payload)
  console.log("Lyrics created", response.data)

  setFormData({
       albumId: 0,
        artistId: 0,
        audioFileUrl: "",
        language: "",
        category: "",
        contents: [
          {
            title: "",
            chorus: "",
            verse1: "",
            verse2: "",
            verse3: "",
            verse4: "",
            verse5: "",
            verse6: "",
          },
        ],
      });
  }
  catch (error: any) {
  console.error("Full Axios error:", error);                 // Logs the entire Axios error object
  console.error("Backend response:", error.response?.data);  // Logs what the backend returned
  alert("Failed to create lyrics. Check console for details.");
}
 }
const filteredArtists = artists.filter((artist) => {
  const mappedLanguage =
    LANGUAGE_MAP[formData.language as keyof typeof LANGUAGE_MAP];

  if (!mappedLanguage) return true;

  return (
    artist.languageKey?.toString().trim().toLowerCase() ===
    mappedLanguage.toString().trim().toLowerCase()
  );
});
  return (
  <div className="lyrics-form-container">
  <form className="lyrics-form" onSubmit={handleSubmit}>
      <div className="grid-2">
        <div>
          <label>Song Title</label>
          <input
            type="text"
            value={formData.contents[0].title}
            onChange={(e) => handleChange(e, 0, "title")}
          />
        </div>

        <div>
          <label>Artist</label>
          <select name="artistId" value={formData.artistId} onChange={handleChange}>
            <option value={0}>Select Artist</option>
            {filteredArtists .map((artist) => (
              <option key={artist.Id} value={artist.Id}>{artist.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Album</label>
          <select 
             name="albumId" 
             value={formData.albumId} 
             onChange={handleChange}>
            <option value="">Select Album</option>
            {albums.map((alb) => (
              <option key={alb.Id} value={alb.Id}>{alb.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Language</label>
          <select 
              name="language" 
              value={formData.language}
              onChange={handleChange}>
            <option value="">Select Language</option>
            {Object.keys(LANGUAGES)
              .map((lang) => (
                <option key={lang} value={lang}>{lang.replace(/_/g, " ")}</option>
              ))}
          </select>
        </div>
      
     <div>
        <label>Category</label>
        <select 
          name="category" 
          value={formData.category}
          onChange={handleChange}>
          <option value="">Select Category</option>
          {Object.values(CATEGORIES).map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace("_", " ")}
            </option>
          ))}
        </select>
     </div>
      { <div>
        <label>Upload Audio</label>
        <input type="file" accept="audio/*" onChange={handleChange} />
      </div> }
       </div>
      <div className="chorus">
      <label>Chorus</label>
      <textarea
        value={formData.contents[0].chorus}
        onChange={(e) => handleChange(e, 0, "chorus")}
      />
    </div>
   
      <div className="verses-grid">
        {[1, 2, 3, 4, 5, 6].map((v) => {
          const field = `verse${v}` as keyof LyricsContent;
          return(
          <div key={v}>
            <label>Verse {v}</label>
            <textarea
              value={formData.contents[0][field]}
              onChange={(e) => handleChange(e, 0, `verse${v}` as any)}
            />
          </div>);
})}
      </div>

      <button className="submit-btn" type="submit">
        💾 Save Lyrics
      </button>
    </form>
  </div>
);

};

export default SongForm;
