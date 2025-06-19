package main

import (
	"bytes"
	"container/heap"
	"encoding/binary"
	"fmt"
	"slices"
	"strconv"
	"strings"
)

func Huffman(texto []byte, contador map[byte]int) *nodo {
	parva := &heapDatos{}

	for _, v := range texto {
		contador[v]++
	}

	heap.Init(parva)

	for key, value := range contador {
		data := new(nodo)
		data.cantidad = value
		data.valor = key

		heap.Push(parva, *data)
	}

	for parva.Len() > 1 {
		nodoIzq := heap.Pop(parva).(nodo)
		nodoDer := heap.Pop(parva).(nodo)

		nodoNuevo := new(nodo)
		nodoNuevo.cantidad = nodoDer.cantidad + nodoIzq.cantidad
		nodoNuevo.valor = 0
		nodoNuevo.izq = &nodoIzq
		nodoNuevo.der = &nodoDer

		heap.Push(parva, *nodoNuevo)
	}

	nodo := heap.Pop(parva).(nodo)

	return &nodo
}

func ConseguirCodigos(nodoActual *nodo, camino string, codigos map[byte]string) {
	if nodoActual.izq == nil && nodoActual.der == nil {
		if camino == "" {
			camino = "0"
		}

		codigos[nodoActual.valor] = camino
		return
	}

	ConseguirCodigos(nodoActual.izq, camino+"1", codigos)
	ConseguirCodigos(nodoActual.der, camino+"0", codigos)
}

func serializar(tabla map[byte]string) []byte {
	buf := new(bytes.Buffer)

	for key, value := range tabla {
		largo := byte(len(value))
		codigo, _ := strconv.ParseUint(value, 2, 32)

		buf.WriteByte(key)
		buf.WriteByte(largo)
		binary.Write(buf, binary.LittleEndian, uint32(codigo))
	}

	return buf.Bytes()
}

func deserializar(data []byte) map[string]byte {
	reader := bytes.NewReader(data)
	res := make(map[string]byte)

	for reader.Len() >= 6 {
		key, _ := reader.ReadByte()
		largo, _ := reader.ReadByte()

		var codigo uint32
		binary.Read(reader, binary.LittleEndian, &codigo)

		codigoStr := fmt.Sprintf("%0*b", largo, codigo)

		res[codigoStr] = key
	}

	return res
}

func Comprimir(file []byte) ([]byte, int) {
	contador := make(map[byte]int)
	codigos := make(map[byte]string)

	raiz := Huffman(file, contador)
	ConseguirCodigos(raiz, "", codigos)

	var comprimido []byte
	var byteDato byte
	contadorBits := 0

	for _, b := range file {
		code := codigos[b]
		for _, bit := range code {
			if bit == '1' {
				byteDato |= 1 << (7 - contadorBits)
			}
			contadorBits++
			if contadorBits == 8 {
				comprimido = append(comprimido, byteDato)
				byteDato = 0
				contadorBits = 0
			}
		}
	}

	if contadorBits > 0 {
		comprimido = append(comprimido, byteDato)
	}

	var bitsValidosUltimoByte byte
	if contadorBits == 0 {
		bitsValidosUltimoByte = 8
	} else {
		bitsValidosUltimoByte = byte(contadorBits)
	}

	tabla := serializar(codigos)

	tamTabla := make([]byte, 4)
	binary.BigEndian.PutUint32(tamTabla, uint32(len(tabla)))

	res := slices.Clone(comprimido)
	res = append(res, bitsValidosUltimoByte)
	res = append(res, tabla...)
	res = append(res, tamTabla...)

	return res, len(comprimido)
}

func Descomprimir(data []byte) []byte {
	tamTabla := binary.BigEndian.Uint32(data[len(data)-4:])
	tablaStart := len(data) - 4 - int(tamTabla)

	tablaSerializada := data[tablaStart : len(data)-4]
	codigos := deserializar(tablaSerializada)

	bitsValidos := data[tablaStart-1]

	comprimido := data[:tablaStart-1]

	var texto strings.Builder
	for i, b := range comprimido {
		bits := 8
		if i == len(comprimido)-1 {
			bits = int(bitsValidos)
		}

		for j := range bits {
			if b&(1<<(7-j)) != 0 {
				texto.WriteByte('1')
			} else {
				texto.WriteByte('0')
			}
		}
	}

	var resultado []byte
	var codigo strings.Builder

	for _, bit := range texto.String() {
		codigo.WriteByte(byte(bit))
		if val, ok := codigos[codigo.String()]; ok {
			resultado = append(resultado, val)
			codigo.Reset()
		}
	}

	return resultado
}
