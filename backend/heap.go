package main

type nodo struct {
	cantidad int
	valor    byte
	izq      *nodo
	der      *nodo
}

type heapDatos []nodo

func (h heapDatos) Len() int {
	return len(h)
}

func (h heapDatos) Less(i int, j int) bool {
	return h[i].cantidad < h[j].cantidad
}

func (h heapDatos) Swap(i int, j int) {
	h[i], h[j] = h[j], h[i]
}

func (h *heapDatos) Push(x any) {
	*h = append(*h, x.(nodo))
}

func (h *heapDatos) Pop() any {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[0 : n-1]
	return x
}
