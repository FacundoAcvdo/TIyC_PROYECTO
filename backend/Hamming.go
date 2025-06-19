package main

import (
	"math"
	"math/big"
	"math/rand/v2"
)

func hamming(texto []byte, tamBloque int) []byte {
	cantCodigos := int(math.Log2(float64(tamBloque))) + 1
	data := new(big.Int).SetBytes(texto)
	indiceInfo := len(texto)*8 - 1
	res := []byte{}

	for i := 0; i < len(texto)*8; i = i + tamBloque - cantCodigos {
		bloque := new(big.Int).SetInt64(0)
		pot := 0

		for j := 1; j <= tamBloque; j++ {
			if j == 1<<pot {
				pot++
			} else {
				if indiceInfo < 0 {
					continue
				} else {
					bloque.SetBit(bloque, tamBloque-j, data.Bit(indiceInfo))
					indiceInfo--
				}
			}
		}

		textoHamming := conseguirCI(bloque, tamBloque)

		bytesBloque := make([]byte, tamBloque/8)
		textoHamming.FillBytes(bytesBloque)

		res = append(res, bytesBloque...)
	}

	largo := new(big.Int).SetInt64(int64(len(texto)))
	bytesLen := make([]byte, 4)
	largo.FillBytes(bytesLen)

	res = append(res, bytesLen...)

	return res
}

func traducir(texto []byte, tamBloque int) []byte {
	textoCurado := []byte{}
	cont, res := 7, uint(0)
	cantBytes := tamBloque / 8
	maxBloques := (len(texto) - 4) / cantBytes

	for i := 0; i < maxBloques; i++ {
		pot := 0
		aux := new(big.Int).SetBytes(texto[cantBytes*i : cantBytes*(i+1)])

		for i := 1; i <= tamBloque; i++ {

			if i == 1<<pot {
				pot++
			} else {
				valor := aux.Bit(tamBloque - i)
				res |= valor << uint(cont)
				cont--
				if cont == -1 {
					textoCurado = append(textoCurado, byte(res))
					res = uint(0)
					cont = 7
				}
			}
		}
	}

	largoOriginal := []byte{texto[len(texto)-4], texto[len(texto)-3], texto[len(texto)-2], texto[len(texto)-1]}
	num := new(big.Int).SetBytes(largoOriginal)
	return textoCurado[:num.Int64()]
}

func conseguirCI(data *big.Int, tamBloque int) *big.Int {
	res := new(big.Int).Set(data)
	cantCodigos := int(math.Log2(float64(tamBloque)))
	paridad := uint(0)

	for i := 0; i < cantCodigos; i++ {
		nroControl := 1 << i
		C := uint(0)

		for j := 1; j <= tamBloque; j++ {
			if j&nroControl != 0 {
				val := res.Bit(tamBloque - j)
				C ^= val
			}
		}

		res.SetBit(res, tamBloque-nroControl, C)
	}

	for i := 0; i < tamBloque; i++ {
		paridad ^= res.Bit(i)
	}

	res.SetBit(res, 0, paridad)

	return res
}

func agregarError_1(textoHamming []byte, tamBloque int) []byte {
	salto := tamBloque / 8
	texto := new(big.Int).SetBytes(textoHamming)
	res := []byte{}
	bytesBloque := make([]byte, len(textoHamming))
	texto.FillBytes(bytesBloque)
	res = append(res, bytesBloque...)

	for i := 0; i < len(res)-4; i = i + salto {
		random := rand.IntN(2)
		if random == 1 {
			random = rand.IntN(8)
			bloque := rand.IntN(salto)
			val := res[i+bloque]
			val ^= 1 << random
			res[i+bloque] = val
		}
	}

	return res
}

func agregarError_2(textoHamming []byte, tamBloque int) []byte {
	salto := tamBloque / 8
	texto := new(big.Int).SetBytes(textoHamming)
	res := []byte{}
	bytesBloque := make([]byte, len(textoHamming))
	texto.FillBytes(bytesBloque)
	res = append(res, bytesBloque...)

	for i := 0; i < len(res)-4; i = i + salto {
		ran := rand.IntN(2)
		if ran == 1 {
			random_1 := rand.IntN(8)
			random_2 := rand.IntN(8)

			for random_1 == random_2 {
				random_2 = rand.IntN(8)
			}

			bloque := rand.IntN(salto)
			val := res[i+bloque]
			val ^= 1 << random_1
			val ^= 1 << random_2
			res[i+bloque] = val
		}
	}

	return res
}

func verificar(textoHamming []byte, tamBloque int) (bool, []byte) {
	res := []byte{}
	salto := tamBloque / 8
	cantCodigos := int(math.Log2(float64(tamBloque)))
	error_Doble := false

	for i := 0; i < len(textoHamming)-4; i = i + salto {
		bloque := new(big.Int).SetBytes(textoHamming[i : i+salto])

		bitParidad := uint(0)
		for j := range tamBloque {
			val := bloque.Bit(j)
			bitParidad ^= val
		}

		sindrome := uint(0)
		for i := range cantCodigos {
			nroControl := 1 << i
			C := uint(0)

			for j := 1; j < tamBloque; j++ {
				if j&nroControl != 0 {
					val := bloque.Bit(tamBloque - j)
					C ^= val
				}
			}

			sindrome |= C << i
		}

		if sindrome == 0 && bitParidad == 1 {
			bloque.SetBit(bloque, 0, bloque.Bit(0)^1)
		}

		if sindrome != 0 && bitParidad == 1 {
			bloque.SetBit(bloque, tamBloque-int(sindrome), bloque.Bit(tamBloque-int(sindrome))^1)
		}

		if sindrome != 0 && bitParidad == 0 {
			error_Doble = true
		}

		bytesBloque := make([]byte, tamBloque/8)
		bloque.FillBytes(bytesBloque)

		if len(bloque.Bytes()) == 0 {
			res = append(res, 0)
		} else {
			res = append(res, bytesBloque...)
		}
	}

	num := new(big.Int).SetBytes(textoHamming[len(textoHamming)-4:])
	bytesLen := make([]byte, 4)
	num.FillBytes(bytesLen)

	res = append(res, bytesLen...)

	return error_Doble, res
}
