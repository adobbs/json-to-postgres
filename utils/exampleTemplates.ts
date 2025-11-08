export interface ExampleTemplate {
  name: string;
  description: string;
  json: string;
}

export const exampleTemplates: ExampleTemplate[] = [
  {
    name: 'E-commerce Store',
    description: 'Product catalog with users, orders, and reviews',
    json: JSON.stringify(
      {
        user: {
          email: 'user@example.com',
          name: 'John Doe',
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
        },
        product: {
          name: 'Laptop Computer',
          description: 'High-performance laptop for professionals',
          price: 1299.99,
          stock: 50,
          category: 'Electronics',
          isAvailable: true,
        },
        order: {
          orderNumber: 'ORD-2024-001',
          user_id: 1,
          totalAmount: 1299.99,
          status: 'pending',
          shippingAddress: {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
          },
          items: [
            {
              product_id: 1,
              quantity: 2,
              price: 1299.99,
            },
          ],
        },
        review: {
          product_id: 1,
          user_id: 1,
          rating: 5,
          comment: 'Great product! Highly recommended.',
          isVerifiedPurchase: true,
        },
      },
      null,
      2
    ),
  },
  {
    name: 'Blog Platform',
    description: 'Articles with authors, comments, and tags',
    json: JSON.stringify(
      {
        author: {
          username: 'johndoe',
          email: 'john@example.com',
          bio: 'Tech enthusiast and writer',
          websiteUrl: 'https://johndoe.com',
          isVerified: true,
        },
        article: {
          title: 'Getting Started with PostgreSQL',
          slug: 'getting-started-with-postgresql',
          content: 'PostgreSQL is a powerful database...',
          excerpt: 'Learn the basics of PostgreSQL',
          author_id: 1,
          publishedAt: '2024-01-15T10:30:00Z',
          viewCount: 1250,
          isPublished: true,
          tags: ['database', 'postgresql', 'tutorial'],
        },
        comment: {
          article_id: 1,
          author_id: 1,
          content: 'Great article! Very helpful.',
          parentComment_id: null,
          isApproved: true,
        },
        tag: {
          name: 'PostgreSQL',
          slug: 'postgresql',
          description: 'Articles about PostgreSQL database',
        },
      },
      null,
      2
    ),
  },
  {
    name: 'Task Management',
    description: 'Projects with tasks, team members, and assignments',
    json: JSON.stringify(
      {
        workspace: {
          name: 'Development Team',
          slug: 'dev-team',
          description: 'Main development workspace',
          isActive: true,
        },
        project: {
          workspace_id: 1,
          name: 'Website Redesign',
          description: 'Complete overhaul of company website',
          startDate: '2024-01-01',
          dueDate: '2024-06-30',
          status: 'in_progress',
          priority: 'high',
        },
        task: {
          project_id: 1,
          title: 'Design homepage mockup',
          description: 'Create wireframes and high-fidelity mockups',
          assignee_id: 1,
          status: 'todo',
          priority: 'high',
          estimatedHours: 8,
          dueDate: '2024-02-15',
          tags: ['design', 'frontend'],
        },
        team_member: {
          workspace_id: 1,
          name: 'Alice Johnson',
          email: 'alice@example.com',
          role: 'designer',
          isActive: true,
        },
      },
      null,
      2
    ),
  },
  {
    name: 'Social Media App',
    description: 'Users with posts, likes, and follows',
    json: JSON.stringify(
      {
        user: {
          username: 'johndoe',
          email: 'john@example.com',
          displayName: 'John Doe',
          bio: 'Software developer and coffee enthusiast',
          avatarUrl: 'https://example.com/avatar.jpg',
          isVerified: true,
          followerCount: 1500,
          followingCount: 320,
        },
        post: {
          user_id: 1,
          content: 'Just launched my new project! Check it out.',
          imageUrl: 'https://example.com/post-image.jpg',
          likeCount: 42,
          commentCount: 8,
          isPublic: true,
          location: 'San Francisco, CA',
        },
        comment: {
          post_id: 1,
          user_id: 2,
          content: 'Awesome work! Congratulations!',
          likeCount: 5,
        },
        like: {
          post_id: 1,
          user_id: 2,
        },
        follow: {
          follower_id: 2,
          following_id: 1,
        },
      },
      null,
      2
    ),
  },
  {
    name: 'Simple User Profile',
    description: 'Basic user profile with contact information',
    json: JSON.stringify(
      {
        user: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phoneNumber: '+1-555-0123',
          dateOfBirth: '1990-05-15',
          isActive: true,
          role: 'admin',
          lastLoginAt: '2024-01-20T14:30:00Z',
        },
      },
      null,
      2
    ),
  },
];
