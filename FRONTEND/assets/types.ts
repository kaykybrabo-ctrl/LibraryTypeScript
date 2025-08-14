export interface Book {
    book_id: number;
    author_id: number;
    title: string;
    publish_id: number;
    category_ids: number[];
    description?: string;
    photo?: string;
    author_name?: string;
    publisher?: string;
    categories?: string;
}

export interface Author {
    author_id: number;
    name_author: string;
    biography?: string;
    photo?: string;
}

export interface Review {
    review_id: number;
    book_id: number;
    user_id: number;
    username: string;
    bookTitle: string;
    rating: number;
    comment?: string;
    review_date: string;
}

export interface Loan {
    loans_id: number;
    book_id: number;
    username: string;
    title: string;
    loan_date: string;
    return_date?: string;
}

export interface UserProfile {
    username: string;
    profile_image?: string;
    description?: string;
}

export interface Publisher {
    publish_id: number;
    publish_name: string;
}

export interface Category {
    category_id: number;
    name_category: string;
}
