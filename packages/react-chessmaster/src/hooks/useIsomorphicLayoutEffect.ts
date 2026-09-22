import { useEffect, useLayoutEffect } from 'react'

// useLayoutEffect warns during server rendering; on the server nothing runs anyway
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
