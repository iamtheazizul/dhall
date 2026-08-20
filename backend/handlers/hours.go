package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
)

type Hours struct {
	Days     []DayHours     `json:"days"`
	Stations []StationHours `json:"stations"`
}

type DayHours struct {
	Day       string `json:"day"`
	Breakfast string `json:"breakfast"`
	Lunch     string `json:"lunch"`
	Dinner    string `json:"dinner"`
	LateNight string `json:"late_night"`
}

type StationHours struct {
	Name  string `json:"name"`
	Hours string `json:"hours"`
}

const hoursFile = "/app/data/hours.json"

func GetHoursHandler(w http.ResponseWriter, r *http.Request) {
	data, err := os.ReadFile(hoursFile)
	if err != nil {
		// Return default hours if file doesn't exist
		defaultHours := Hours{
			Days: []DayHours{
				{Day: "Monday", Breakfast: "7:00 AM - 11:00 AM", Lunch: "11:00 AM - 2:00 PM", Dinner: "5:00 PM - 8:00 PM", LateNight: "8:00 PM - 10:00 PM"},
				{Day: "Tuesday", Breakfast: "7:00 AM - 10:30 AM", Lunch: "11:00 AM - 2:00 PM", Dinner: "5:00 PM - 8:00 PM", LateNight: "8:00 PM - 10:00 PM"},
				{Day: "Wednesday", Breakfast: "7:00 AM - 10:30 AM", Lunch: "11:00 AM - 2:00 PM", Dinner: "5:00 PM - 8:00 PM", LateNight: "8:00 PM - 10:00 PM"},
				{Day: "Thursday", Breakfast: "7:00 AM - 10:30 AM", Lunch: "11:00 AM - 2:00 PM", Dinner: "5:00 PM - 8:00 PM", LateNight: "8:00 PM - 10:00 PM"},
				{Day: "Friday", Breakfast: "7:00 AM - 10:30 AM", Lunch: "11:00 AM - 2:00 PM", Dinner: "5:00 PM - 8:00 PM", LateNight: ""},
				{Day: "Saturday", Breakfast: "8:00 AM - 11:00 AM", Lunch: "12:00 PM - 3:00 PM", Dinner: "5:00 PM - 8:00 PM", LateNight: ""},
				{Day: "Sunday", Breakfast: "8:00 AM - 11:00 AM", Lunch: "12:00 PM - 3:00 PM", Dinner: "5:00 PM - 8:00 PM", LateNight: "8:00 PM - 10:00 PM"},
			},
			Stations: []StationHours{
				{Name: "Diner", Hours: "7:00 AM - 8:00 PM"},
				{Name: "Emily's Garden", Hours: "7:00 AM - 8:00 PM"},
				{Name: "Global/Noodle Bar", Hours: "11:00 AM - 8:00 PM"},
				{Name: "Minus 9", Hours: "5:00 PM - 8:00 PM"},
				{Name: "The Corner Deli", Hours: "7:00 AM - 8:00 PM"},
				{Name: "Supremo's", Hours: "11:00 AM - 8:00 PM"},
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(defaultHours)
		return
	}

	var hours Hours
	if err := json.Unmarshal(data, &hours); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(hours)
}

func UpdateHoursHandler(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var hours Hours
	if err := json.Unmarshal(body, &hours); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	data, err := json.MarshalIndent(hours, "", "  ")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := os.WriteFile(hoursFile, data, 0644); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(hours)
}