import React from 'react'
import { useState } from 'react'
import { Box, FileUpload, Alert , Icon, Button, Text } from "@chakra-ui/react"
import { LuUpload } from "react-icons/lu"
import "./Hamming.css"

const url_comprimir = import.meta.env.VITE_COMPRIMIR_URL;
const url_descomprimir = import.meta.env.VITE_DESCOMPRIMIR_URL;

function Huffman() {
  const [hayArchivo, setHayArchivo] = useState(true)
  
  const [accepted, setAccepted] = useState(undefined)
  const [result, setResult] = useState(undefined)
  const [hayResultado, setHayResultado] = useState(false)
  const [nombreArchivo, setNombreArchivo] = useState("")
  const [formato, setFormato] = useState("")
  const [tamComprimido, setTamComprimido] = useState(0)

  const handleComprimir = async () => {
    setHayArchivo(true)

    if (accepted == undefined) {
      setHayArchivo(false)
      return
    }
    
    console.log(accepted)

    setNombreArchivo(accepted.name.slice(0, accepted.name.length-4)+"_comprimido.huf")
    const formData = new FormData();
    formData.append("file", accepted);
  
    const res = await fetch(url_comprimir, {
      method: "POST",
      body: formData,
    })

    setTamComprimido(parseInt(res.headers.get("Compressed-Size")))

    if(isNaN(tamComprimido)){
      setTamComprimido(1)
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    setHayResultado(true)
    setResult(url)
  }

  const handleDescomprimir = async () => {
    setHayArchivo(true)

    if (accepted == undefined) {
      setHayArchivo(false)
      return
    }
    
    setNombreArchivo(accepted.name.slice(0, accepted.name.length-4)+"_descomprimido.dhu")
    const formData = new FormData();
    formData.append("file", accepted);
  
    const res = await fetch(url_descomprimir, {
      method: "POST",
      body: formData,
    });
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    setHayResultado(true)
    setResult(url)
  }


  const cargarArchivo = (archivos) => {
    setAccepted(archivos.files[0])
    setFormato(archivos.files[0].name.slice(archivos.files[0].name.length-4, archivos.files[0].name.length))
    setResult(undefined)
    setHayResultado(false)
  }


  return (
        <div className='contenedor'>
        <FileUpload.Root maxW="xl" alignItems="stretch" maxFiles={1} onFileAccept={ (archivos) => { cargarArchivo(archivos) }} className='item'>
          <FileUpload.HiddenInput />
          <FileUpload.Dropzone>
            <Icon size="md" color="fg.muted">
              <LuUpload />
            </Icon>
            <FileUpload.DropzoneContent>
              <Box>Arrastra y suelta los archivos aqui</Box>
            </FileUpload.DropzoneContent>
          </FileUpload.Dropzone>
          <FileUpload.List />
        </FileUpload.Root>

        <div className='select'>
            <Button variant="surface" onClick={handleComprimir} className='item' >Comprimir</Button>
            <Button variant="surface" onClick={handleDescomprimir} className='item' >Descomprimir</Button>
    
          {result != undefined && 
            <Button variant="surface" className='item' onClick={() => setHayResultado(false)}>
              <a href={result} download={nombreArchivo}>Descargar</a>
            </Button>
          }
        </div>

        {!hayArchivo && <Alert.Root status="error" className='item alerta'>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Falta cargar archivo</Alert.Title>
              <Alert.Description>
                Se debe cargar un archivo para continuar
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>}

        {hayResultado && <Alert.Root status="success" className='item alerta'>
          <Alert.Indicator />
          <Alert.Title>Archivo procesado con éxito</Alert.Title>
        </Alert.Root>
        }

        {hayResultado && <Text fontWeight="semibold">Tamaño original: {accepted.size} bytes</Text>}
        {hayResultado && <Text fontWeight="semibold">Tamaño comprimido: {tamComprimido} bytes</Text>}
        {hayResultado && <Text fontWeight="semibold">Porcentaje compresión: {(100-((tamComprimido/accepted.size)*100)).toFixed(2)}%</Text>}
        </div>
  )
}

export default Huffman