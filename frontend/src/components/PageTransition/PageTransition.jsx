"use client";

import { motion } from "framer-motion";

const pageVariants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
    },
    exit: {
        opacity: 0,
    },
};

const pageTransition = {
    duration: 0.4,
    ease: "easeInOut",
};

export default function PageTransition({ children }) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="h-full w-full"
        >
            {children}
        </motion.div>
    );
}
