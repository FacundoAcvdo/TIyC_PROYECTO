import React from 'react'
import { useState } from 'react'
import { Box, FileUpload, Alert , Icon, Button } from "@chakra-ui/react"
import { LuUpload } from "react-icons/lu"
import "./Hamming.css"

const url_traducir = import.meta.env.VITE_TRADUCIR_URL;

function Traducir() {
  const [hayArchivo, setHayArchivo] = useState(true)
  const [formatoErroneo, setFormatoErroneo] = useState(false)
  
  const [accepted, setAccepted] = useState(undefined)
  const [result, setResult] = useState(undefined)
  const [formato, setFormato] = useState("")
  const [nombreArchivo, setNombreArchivo] = useState("")
  const [hayResultado, setHayResultado] = useState(false)
  const [errorDoble, setErrorDoble] = useState(false)

  const handleTraducir = async (corregir) => {
    let tam
    setHayArchivo(true)
    setFormatoErroneo(false)

    if (accepted == undefined) {
      setHayArchivo(false)
      return
    }
      
    if (formato == ".HA1" | formato == ".HE1") {
      tam = 8
    } else if (formato == ".HA2" | formato == ".HE2") {
      tam = 256
    }else if (formato == ".HA3" | formato == ".HE3") {
      tam = 4096
    }else{
        setFormatoErroneo(true)
        return
    }

    if (corregir){
      switch (tam) {
        case 8:
          setNombreArchivo(accepted.name.slice(0, accepted.name.length-4)+"_traducido.DC1")
        break
        case 256:
          setNombreArchivo(accepted.name.slice(0, accepted.name.length-4)+"_traducido.DC2")
        break
        default:
          setNombreArchivo(accepted.name.slice(0, accepted.name.length-4)+"_traducido.DC3")
        break
      }
    }else{
      switch (tam) {
        case 8:
          setNombreArchivo(accepted.name.slice(0, accepted.name.length-4)+"_traducido.DE1")
        break
        case 256:
          setNombreArchivo(accepted.name.slice(0, accepted.name.length-4)+"_traducido.DE2")
        break
        default:
          setNombreArchivo(accepted.name.slice(0, accepted.name.length-4)+"_traducido.DE3")
        break
      }
    }

    const formData = new FormData();
    formData.append("file", accepted);
    formData.append("tamBloque", tam);
    formData.append("verificar", corregir);
  
    const res = await fetch(url_traducir, {
      method: "POST",
      body: formData,
    });
    
    const status = res.headers.get("ErrorDoble")
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    setResult(url)

    if (status == "error") {
      setErrorDoble(true)
    }else{
      setHayResultado(true)
    }
  }

  const cargarArchivo = (archivos) => {
    setAccepted(archivos.files[0])
    setFormato(archivos.files[0].name.slice(archivos.files[0].name.length-4, archivos.files[0].name.length))
    setNombreArchivo("")
    setResult(undefined)
    setHayResultado(false)
    setErrorDoble(false)
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
              <Box color="fg.muted">.ha1, .ha2, .ha3, .he1, .he2, .he3</Box>
            </FileUpload.DropzoneContent>
          </FileUpload.Dropzone>
          <FileUpload.List />
        </FileUpload.Root>
        
        <div className='select'>
          <Button variant="surface" onClick={() => handleTraducir(false) } className='item' >Decodificar sin corregir</Button>
          { formato.slice(0,3) == ".HE" && <Button variant="surface" onClick={()=> handleTraducir(true) } className='item' >Decodificar corrigiendo</Button>}
    
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
                Se debe cargar un archivo para aplicar la codificación
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>}

        {formatoErroneo && <Alert.Root status="error" className='item alerta'>
        <Alert.Indicator />
        <Alert.Content>
            <Alert.Title>Formato de archivo erroneo</Alert.Title>
            <Alert.Description>
            Se debe cargar un archivo con los formatos indicados
            </Alert.Description>
        </Alert.Content>
        </Alert.Root>}

        {hayResultado && <Alert.Root status="success" className='item alerta'>
          <Alert.Indicator />
          <Alert.Title>Archivo decodificado con éxito</Alert.Title>
        </Alert.Root>
        }

        {errorDoble && <Alert.Root status="warning" className='item alerta'>
          <Alert.Indicator />
          <Alert.Title>El archivo tiene 2 errores por bloque. La decodificación es incorrecta</Alert.Title>
        </Alert.Root>
        }
        </div>
  )
}

export default Traducir