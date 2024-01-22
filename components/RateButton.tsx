"use client"
import { FloatingFocusManager, useClick, useDismiss, useFloating, useInteractions } from "@floating-ui/react"
import { range } from "ramda"
import { useState } from "react"

export default function RateButton({ score }) {
  const [isOpen, setIsOpen] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
  })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, ,])
  return (
    <>
      <button ref={refs.setReference} {...getReferenceProps()}>
        {score || "rate"}
      </button>
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="w-1/3 grid grid-cols-2 border border-black bg-white shadow"
          >
            {range(0, 21).map(n => (
              <button
                key={n}
                className="py-1 border border-black"
                onClick={() => alert(`todo implement rate ${n / 2}`)}
              >
                {n / 2}
              </button>
            ))}
          </div>
        </FloatingFocusManager>
      )}
    </>
  )
}
