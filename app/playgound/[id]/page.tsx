"use client"
import { usePlayground } from '@/modules/playgound/hooks/usePlayground'
import { log } from 'console'
import { useParams } from 'next/navigation'
import React from 'react'

const MainPlaygoundPage = () => {
    const {id} = useParams<{id : string}>()

    const { playgroundData, templateData, isLoading, error, saveTemplateData } = usePlayground(id);

    console.log("templateData : ", templateData);
    console.log("playgroundData : ", playgroundData);
    
    
    
  return (
    <div>
        Params : {id}
    </div>
  )
}

export default MainPlaygoundPage