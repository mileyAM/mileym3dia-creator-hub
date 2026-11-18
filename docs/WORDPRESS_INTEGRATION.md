# MILEYM3DIA Creator Hub — WordPress Architecture Guide

This document outlines the production architecture for deploying or integrating the **MILEYM3DIA Creator Toolbox** within a WordPress environment (e.g., using WordPress as a headless CMS with REST/GraphQL, or as a native theme/block plugin).

---

## 1. Custom Post Type: `m3_tool`

Register the custom post type with full Gutenberg, revision, and REST API support:

```php
<?php
/**
 * Register M3 Creator Tool Custom Post Type
 */
function m3_register_tool_cpt() {
    $labels = array(
        'name'                  => _x('Creator Tools', 'Post type general name', 'm3'),
        'singular_name'         => _x('Creator Tool', 'Post type singular name', 'm3'),
        'menu_name'             => _x('Creator Tools', 'Admin Menu text', 'm3'),
        'name_admin_bar'        => _x('Tool', 'Add New on Toolbar', 'm3'),
        'add_new'               => __('Add New Tool', 'm3'),
        'add_new_item'          => __('Add New Creator Tool', 'm3'),
        'new_item'              => __('New Tool', 'm3'),
        'edit_item'             => __('Edit Tool', 'm3'),
        'view_item'             => __('View Tool', 'm3'),
        'all_items'             => __('All Tools', 'm3'),
        'search_items'          => __('Search Tools', 'm3'),
        'not_found'             => __('No tools found.', 'm3'),
        'not_found_in_trash'    => __('No tools found in Trash.', 'm3')
    );

    $args = array(
        'labels'             => $labels,
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array('slug' => 'tools'),
        'capability_type'    => 'post',
        'has_archive'        => true,
        'hierarchical'       => false,
        'menu_position'      => 20,
        'menu_icon'          => 'dashicons-hammer',
        'supports'           => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'revisions'),
        'show_in_rest'       => true,
        'rest_base'          => 'tools',
        'rest_controller_class' => 'WP_REST_Posts_Controller',
    );

    register_post_type('m3_tool', $args);
}
add_action('init', 'm3_register_tool_cpt');
```

---

## 2. Custom Taxonomies

To mirror the GitHub Pages schema:

```php
<?php
/**
 * Register Taxonomies: Category, Subcategory, Platform, Pricing
 */
function m3_register_tool_taxonomies() {
    // 1. Tool Category (Music, Video, Design, AI, Business, Utilities)
    register_taxonomy('tool_category', 'm3_tool', array(
        'labels'            => array('name' => 'Tool Categories', 'singular_name' => 'Category'),
        'hierarchical'      => true,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'rewrite'           => array('slug' => 'tool-category')
    ));

    // 2. Platform (macOS, Windows, Web, iOS, Android, Linux)
    register_taxonomy('tool_platform', 'm3_tool', array(
        'labels'            => array('name' => 'Platforms', 'singular_name' => 'Platform'),
        'hierarchical'      => false,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'rewrite'           => array('slug' => 'platform')
    ));

    // 3. Pricing Model (Free, Freemium, Paid, Subscription, Open Source)
    register_taxonomy('tool_pricing', 'm3_tool', array(
        'labels'            => array('name' => 'Pricing Models', 'singular_name' => 'Pricing Model'),
        'hierarchical'      => false,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_rest'      => true,
        'rewrite'           => array('slug' => 'pricing')
    ));
}
add_action('init', 'm3_register_tool_taxonomies');
```

---

## 3. Metadata Fields (ACF or Core Post Meta)

| Field Name | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| **Official Website URL** | `url` | `m3_website_url` | Direct official landing page |
| **Download URL** | `url` | `m3_download_url` | Direct download / installer link |
| **Verified Status** | `true_false` | `m3_is_verified` | Verified link & information |
| **Last Verified Date** | `date_picker` | `m3_last_verified` | YYYY-MM-DD audit date |
| **Open Source** | `true_false` | `m3_open_source` | Software is FOSS |
| **GitHub Repo** | `url` | `m3_github_repo` | Source repository |
| **Featured Status** | `true_false` | `m3_is_featured` | Spotlight in UI |
| **Pricing Starting Price** | `number` | `m3_price_amount` | E.g., `0`, `9.99` |
| **Price Currency** | `text` | `m3_price_currency` | E.g., `USD` |
| **Affiliate / Partner URL** | `url` | `m3_affiliate_url` | Optional monetization link |

---

## 4. Headless REST API Sync Endpoint

To allow seamless synchronization from WordPress directly to the static GitHub Pages or mobile apps:

```php
<?php
/**
 * REST API Endpoint: /wp-json/m3/v1/resources
 */
add_action('rest_api_init', function () {
    register_rest_route('m3/v1', '/resources', array(
        'methods'  => 'GET',
        'callback' => 'm3_get_all_resources_json',
        'permission_callback' => '__return_true'
    ));
});

function m3_get_all_resources_json() {
    $query = new WP_Query(array(
        'post_type'      => 'm3_tool',
        'posts_per_page' => -1,
        'post_status'    => 'publish'
    ));

    $tools = array();
    while ($query->have_posts()) {
        $query->the_post();
        $id = get_the_ID();

        $categories = wp_get_post_terms($id, 'tool_category', array('fields' => 'slugs'));
        $platforms  = wp_get_post_terms($id, 'tool_platform', array('fields' => 'slugs'));
        $pricing    = wp_get_post_terms($id, 'tool_pricing', array('fields' => 'slugs'));

        $tools[] = array(
            'id'           => get_post_field('post_name', $id),
            'name'         => get_the_title(),
            'slug'         => get_post_field('post_name', $id),
            'description'  => get_the_excerpt(),
            'category'     => !empty($categories) ? $categories[0] : 'tools',
            'subcategory'  => get_post_meta($id, 'm3_subcategory', true) ?: 'General',
            'website'      => get_post_meta($id, 'm3_website_url', true) ?: '',
            'download'     => get_post_meta($id, 'm3_download_url', true) ?: '',
            'pricing'      => array(
                'type'     => !empty($pricing) ? $pricing[0] : 'unknown',
                'price'    => get_post_meta($id, 'm3_price_amount', true),
                'currency' => get_post_meta($id, 'm3_price_currency', true) ?: 'USD'
            ),
            'platforms'    => $platforms,
            'openSource'   => (bool) get_post_meta($id, 'm3_open_source', true),
            'verified'     => (bool) get_post_meta($id, 'm3_is_verified', true),
            'featured'     => (bool) get_post_meta($id, 'm3_is_featured', true),
            'lastVerified' => get_post_meta($id, 'm3_last_verified', true) ?: null
        );
    }
    wp_reset_postdata();

    return rest_ensure_response(array(
        'version'   => '2.0.0',
        'name'      => 'MILEYM3DIA Creator Hub',
        'count'     => count($tools),
        'resources' => $tools
    ));
}
```
