// Animation variants for Framer Motion components

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
}

export const cardVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1,
    opacity: 0.85,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 1,
    transition: {
      duration: 0.15,
      ease: "easeOut"
    }
  }
}

export const buttonVariants = {
  initial: {
    scale: 1
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.15,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.08,
      ease: "easeOut"
    }
  },
  loading: {
    scale: [1, 1.01, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const iconVariants = {
  initial: {
    rotate: 0,
    scale: 1
  },
  animate: {
    rotate: 0,
    scale: 1
  },
  hover: {
    rotate: 2,
    scale: 1.05,
    transition: {
      duration: 0.15,
      ease: "easeOut"
    }
  },
  loading: {
    rotate: 360,
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

export const textVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
}

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

export const staggerItem = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

export const slideVariants = {
  initial: {
    x: -100,
    opacity: 0
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  exit: {
    x: 100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
}

export const scaleVariants = {
  initial: {
    scale: 0,
    opacity: 0
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "backOut"
    }
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

export const progressVariants = {
  initial: {
    width: "0%"
  },
  animate: (progress) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  })
}

export const uploadZoneVariants = {
  initial: {
    borderColor: "oklch(0.7 0.05 240)"
  },
  dragOver: {
    borderColor: "oklch(0.4 0.15 240)",
    backgroundColor: "oklch(0.4 0.15 240 / 0.05)",
    transition: {
      duration: 0.1,
      ease: "easeOut"
    }
  },
  dragLeave: {
    borderColor: "oklch(0.7 0.05 240)",
    backgroundColor: "transparent",
    transition: {
      duration: 0.1,
      ease: "easeOut"
    }
  }
}

export const resultVariants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
}

export const errorVariants = {
  initial: {
    opacity: 0,
    x: -10
  },
  animate: {
    opacity: 1,
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: "easeOut",
      x: {
        duration: 0.4,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1]
      }
    }
  }
}

export const successVariants = {
  initial: {
    opacity: 0,
    scale: 0.8
  },
  animate: {
    opacity: 1,
    scale: [0.8, 1.1, 1],
    transition: {
      duration: 0.6,
      ease: "easeOut",
      scale: {
        times: [0, 0.6, 1]
      }
    }
  }
}

export const floatingVariants = {
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Utility function to create custom variants
export const createCustomVariant = (config) => {
  return {
    initial: config.initial || {},
    animate: config.animate || {},
    exit: config.exit || {},
    hover: config.hover || {},
    tap: config.tap || {}
  }
}

// Responsive variants that adapt to screen size
export const responsiveVariants = {
  mobile: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  },
  desktop: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }
}

// Accessibility-aware variants
export const a11yVariants = {
  respectMotion: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } }
  },
  fullMotion: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }
}

