import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/add.album.css";

type CreateAlbumForm = {
  title: string;
  artistId: number | "";
  releaseDate: string;
  coverImageUrl: string;
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
const AlbumForm = () => {
   const [artists, setArtists] = useState<Artist[]>([])
  const [formData, setFormData] = useState<CreateAlbumForm>({
    title: "",
    artistId:"",
    releaseDate: "",
    coverImageUrl: "",
  });
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload ={
      ...formData, 
      artistId :Number(formData.artistId),
      releaseDate : new Date(formData.releaseDate),
      coverImageUrl: formData.coverImageUrl
    }
    try {
      const response = await axios.post(
        "https://sda-songs-be.onrender.com/albums",
        payload
      );
      console.log("Album created:", response.data);
      // Reset form
      setFormData({ title: "", artistId: "", releaseDate: "", coverImageUrl: "" });
    } catch (error) {
      console.error("Error creating Album:", error);
    }
  };
  useEffect(() =>{
   axios
   
         .get("https://sda-songs-be.onrender.com/artists")
         .then((res) =>setArtists(res.data))
         .catch((err) =>console.error(err))
},[])
  return (
    <div className="form-container">
      <h2>Add New Album</h2>
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <label>Artist</label>
        <select name="artistId" onChange={handleChange}>
            <option value="">Select Artist</option>
            {artists.map((artist) => (
              <option key={artist.Id} value={artist.Id}>
                {artist.name}
              </option>
            ))}
          </select>

        <label>ReleaseDate</label>
        <input
          type ="date"
          name="releaseDate"
          value={formData.releaseDate}
          onChange={handleChange}
        ></input>

        <label>Cover Image URL</label>
        <input
          type="text"
          name="coverImageUrl"
          value={formData.coverImageUrl}
          onChange={handleChange}
        />

        <button type="submit">Save Album</button>
      </form>   
    </div>
  );
};

export default AlbumForm;
