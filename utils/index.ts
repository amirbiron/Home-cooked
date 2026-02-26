export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}

// חילוץ מזהה פוסט מקישור אינסטגרם
export function extractInstagramPostId(url: string | null | undefined): string | null {
    if (!url) return null;
    const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
}