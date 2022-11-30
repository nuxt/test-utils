export const useSingleState = () => useState<{ field?: string }>('single', () => ({}))
