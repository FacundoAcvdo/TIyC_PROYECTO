package main

import (
	"fmt"
	"io"
	"net/http"
	"strconv"
)

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Expose-Headers", "ErrorDoble, Compressed-Size")
}

func handleHamming(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method != "POST" {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error reading file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Error reading file content", http.StatusInternalServerError)
		return
	}

	numeroStr := r.FormValue("tamBloque")
	var tamBloque int
	if _, err := fmt.Sscanf(numeroStr, "%d", &tamBloque); err != nil {
		http.Error(w, "Número inválido", http.StatusBadRequest)
		return
	}

	numeroErrores := r.FormValue("cantErrores")
	var cantErrores int
	if _, err := fmt.Sscanf(numeroErrores, "%d", &cantErrores); err != nil {
		http.Error(w, "Número inválido", http.StatusBadRequest)
		return
	}

	result := hamming(data, tamBloque)
	resultErrores := []byte{}

	if cantErrores == 1 {
		resultErrores = agregarError_1(result, tamBloque)
	} else if cantErrores == 2 {
		resultErrores = agregarError_2(result, tamBloque)
	}

	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", "attachment; filename=resultado.txt")
	w.WriteHeader(http.StatusOK)

	if cantErrores != 0 {
		w.Write(resultErrores)
	} else {
		w.Write(result)
	}
}

func handleTraducir(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method != "POST" {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error reading file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Error reading file content", http.StatusInternalServerError)
		return
	}

	numeroStr := r.FormValue("tamBloque")
	var tamBloque int
	if _, err := fmt.Sscanf(numeroStr, "%d", &tamBloque); err != nil {
		http.Error(w, "Número inválido", http.StatusBadRequest)
		return
	}

	controlCorregir := r.FormValue("verificar")
	var corregir bool
	if _, err := fmt.Sscanf(controlCorregir, "%t", &corregir); err != nil {
		http.Error(w, "Valor invalido", http.StatusBadRequest)
		return
	}

	var result = []byte{}
	errorDoble := false

	w.Header().Set("ErrorDoble", "ok")
	if corregir {
		errorDoble, result = verificar(data, tamBloque)
		if errorDoble {
			w.Header().Set("ErrorDoble", "error")
		}
	} else {
		result = data
	}

	traducido := traducir(result, tamBloque)

	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", "attachment; filename=resultado.txt")
	w.WriteHeader(http.StatusOK)

	w.Write(traducido)
}

func handleComprimir(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method != "POST" {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error reading file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Error reading file content", http.StatusInternalServerError)
		return
	}

	if len(data) == 0 {
		w.Header().Set("Content-Type", "application/octet-stream")
		w.Header().Set("Content-Disposition", "attachment; filename=resultado.txt")
		w.WriteHeader(http.StatusOK)
		w.Write(data)
		return
	}

	comprimido, tamComprimido := Comprimir(data)

	w.Header().Set("Compressed-Size", strconv.Itoa(tamComprimido))
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", "attachment; filename=resultado.txt")
	w.WriteHeader(http.StatusOK)
	w.Write(comprimido)
}

func handleDescomprimir(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)

	if r.Method != "POST" {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error reading file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Error reading file content", http.StatusInternalServerError)
		return
	}

	descomprimido := Descomprimir(data)

	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", "attachment; filename=resultado.txt")
	w.WriteHeader(http.StatusOK)

	w.Write(descomprimido)
}

func main() {
	http.HandleFunc("/hamming", handleHamming)
	http.HandleFunc("/traducir", handleTraducir)
	http.HandleFunc("/comprimir", handleComprimir)
	http.HandleFunc("/descomprimir", handleDescomprimir)
	http.ListenAndServe(":8080", nil)
}
