"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

interface ImageCarouselProps {
  images: string[];
  aspectRatio?: "square" | "video";
  autoplay?: boolean;
  loop?: boolean;
}

export function ImageCarousel({
  images,
  aspectRatio = "video",
  autoplay = true,
  loop = true,
}: ImageCarouselProps) {
  const plugin = React.useRef(
    autoplay
      ? Autoplay({ delay: 5000, stopOnInteraction: false })
      : undefined
  );

  const pluginsToUse = autoplay && plugin.current ? [plugin.current] : [];

  return (
    <Carousel
      plugins={pluginsToUse}
      className="w-full max-w-4xl mx-auto"
      opts={{ loop: loop }}
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="overflow-hidden bg-[#dbeafe]">
                <CardContent className="flex items-center justify-center p-0">
                  <img
                    src={image}
                    alt={`Carousel image ${index + 1}`}
                    className={`w-full object-cover ${
                      aspectRatio === "video" ? "aspect-video" : "aspect-square"
                    }`}
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}