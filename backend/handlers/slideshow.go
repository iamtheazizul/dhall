package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

type SlideshowImage struct {
	ID       string `json:"id"`
	URL      string `json:"url"`
	Filename string `json:"filename"` // NEW: store original filename
	Caption  string `json:"caption"`
	Order    int    `json:"order"`
    Link     string `json:"link"` 
}

const slideshowFile = "/app/data/slideshow.json"
const uploadsDir = "/app/data/uploads"

// Initialize uploads directory
func init() {
	os.MkdirAll(uploadsDir, 0755)
}

func GetSlideshowHandler(w http.ResponseWriter, r *http.Request) {
	data, err := os.ReadFile(slideshowFile)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]SlideshowImage{})
		return
	}

	var images []SlideshowImage
	if err := json.Unmarshal(data, &images); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(images)
}

func UploadSlideshowImageHandler(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form (10MB max)
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "File too large", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "No file uploaded", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate file type
	contentType := header.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		http.Error(w, "File must be an image", http.StatusBadRequest)
		return
	}

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := uuid.New().String() + ext
	filepath := filepath.Join(uploadsDir, filename)

	// Save file
	dst, err := os.Create(filepath)
	if err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}

	// Get form data
	caption := r.FormValue("caption")
	link := r.FormValue("link") 
	order := 1
	fmt.Sscanf(r.FormValue("order"), "%d", &order)

	// Create image record
	newImage := SlideshowImage{
		ID:       uuid.New().String(),
		URL:      "/uploads/" + filename,
		Filename: header.Filename,
		Caption:  caption,
		Link:	  link,
		Order:    order,
	}

	// Read existing images
	var images []SlideshowImage
	data, err := os.ReadFile(slideshowFile)
	if err == nil {
		json.Unmarshal(data, &images)
	}

	images = append(images, newImage)

	// Save metadata
	data, err = json.MarshalIndent(images, "", "  ")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := os.WriteFile(slideshowFile, data, 0644); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newImage)
}

func UpdateSlideshowImageHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing id parameter", http.StatusBadRequest)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var updatedImage SlideshowImage
	if err := json.Unmarshal(body, &updatedImage); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Read existing
	data, err := os.ReadFile(slideshowFile)
	if err != nil {
		http.Error(w, "Slideshow file not found", http.StatusNotFound)
		return
	}

	var images []SlideshowImage
	if err := json.Unmarshal(data, &images); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update
	found := false
	for i, img := range images {
		if img.ID == id {
			// Keep the original URL and filename if not changed
			if updatedImage.URL == "" {
				updatedImage.URL = img.URL
			}
			if updatedImage.Filename == "" {
				updatedImage.Filename = img.Filename
			}
			images[i] = updatedImage
			found = true
			break
		}
	}

	if !found {
		http.Error(w, "Image not found", http.StatusNotFound)
		return
	}

	// Save
	data, err = json.MarshalIndent(images, "", "  ")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := os.WriteFile(slideshowFile, data, 0644); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedImage)
}

func DeleteSlideshowImageHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing id parameter", http.StatusBadRequest)
		return
	}

	// Read existing
	data, err := os.ReadFile(slideshowFile)
	if err != nil {
		http.Error(w, "Slideshow file not found", http.StatusNotFound)
		return
	}

	var images []SlideshowImage
	if err := json.Unmarshal(data, &images); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Find and delete file
	// REMOVED: var deletedImage SlideshowImage
	newImages := []SlideshowImage{}
	for _, img := range images {
		if img.ID == id {
			// Delete physical file if it's an uploaded file
			if strings.HasPrefix(img.URL, "/uploads/") {
				filename := strings.TrimPrefix(img.URL, "/uploads/")
				os.Remove(filepath.Join(uploadsDir, filename))
			}
		} else {
			newImages = append(newImages, img)
		}
	}

	// Save
	data, err = json.MarshalIndent(newImages, "", "  ")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := os.WriteFile(slideshowFile, data, 0644); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}