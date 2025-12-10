"use client"

import OccasionPageTemplate from "@/components/occasion-page-template"

export default function GreetingsNewbornPage() {
  return (
    <OccasionPageTemplate
      category="greetings"
      categoryTitle="تهنئات"
      occasion="newborn"
      occasionTitle="مواليد"
      backHref="/services/greetings"
    />
  )
}
