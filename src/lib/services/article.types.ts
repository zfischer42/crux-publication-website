export interface ArticlePreview {
    slug        : string,
    title       : string,
    author      : string, // Legacy field - keep for backward compatibility
    authors    ?: string[], // Array of author IDs
    date        : Date,
    categories  : Category[],
    description : string,
    image       : Content,
    likes      ?: number,
}

export interface Article {
    preview     : ArticlePreview
    comments   ?: Comment[],
    content     : Content[]
}

export interface Author {
    name         : string,
    title        : string,
    pfp         ?: string,
    linkedin    ?: string,
    articles     : string[] // Array of article slugs
}

export interface Content {
    type         : 'image' | 'paragraph' | 'header' | 'video' | 'custom_html',
    src         ?: string,  // Image
    file        ?: File,    // Image
    fileName    ?: string,  // Image
    credits     ?: string,  // Image
    text        ?: string,  // Paragraph, Custom HTML
    inputRef    ?: HTMLInputElement // For file input references in editor
}

export interface Comment {
    username    : string,
    text        : string,
}

export type Category = 'Business' | 'Technology' | 'Science' | 'All' | 'OpEd' | 'Creative' | 'Commentary';