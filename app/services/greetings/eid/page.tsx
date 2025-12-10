"use client"

import OccasionPageTemplate from "@/components/occasion-page-template"

export default function GreetingsEidPage() {
  return (
    <OccasionPageTemplate
      category="greetings"
      categoryTitle="تهنئات"
      occasion="eid"
      occasionTitle="عيد"
      backHref="/services/greetings"
    />
  )
}
