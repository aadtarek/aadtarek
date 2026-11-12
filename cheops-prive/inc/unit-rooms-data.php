<?php
/**
 * Bedrooms, bathrooms and room areas for the units listed on the community
 * reference pages (cheops.front.aait-d.com/communities/...). Copied onto the
 * units once; anything already filled in on a unit is left as it is.
 */
if (!defined('ABSPATH')) exit;

function cheops_reference_unit_rooms() {
    return [
        'F-IV-63-A2-2' => ['layout' => '2 Bedrooms + 2 Bathrooms + Reception + Lobby + Kitchen + Dressing + Terrace', 'rooms' => "Reception | 27.53 sqm\nBathroom | 4.5 sqm\nDressing | 2 sqm\nLobby | 6 sqm\nMaster Bathroom | 4.5 sqm\nBedroom 1 | 13 sqm\nKitchen | 9.5 sqm\nMaster Bedroom 1 | 14.45 sqm\nTerrace | 8 sqm", 'beds' => 2, 'baths' => 2, 'floor' => 'Second Floor'],
        'F-IV-64-B2-2' => ['layout' => '2 Bedrooms + 2 Bathrooms + Reception + Lobby + Kitchen + Dressing + Terrace', 'rooms' => "Reception | 27.53 sqm\nBathroom | 4.5 sqm\nDressing | 2 sqm\nLobby | 6 sqm\nMaster Bathroom | 4.5 sqm\nBedroom 1 | 13 sqm\nKitchen | 9.5 sqm\nMaster Bedroom 1 | 14.45 sqm\nTerrace | 8 sqm", 'beds' => 2, 'baths' => 2, 'floor' => 'Second Floor'],
        'F-IVGR-51-A0-2' => ['layout' => '3 Bedrooms + 3 Bathrooms + Reception & Dining + Lobby + 2 Dressing + Kitchen + Maid Room + 2 Terrace + 2 Staircase', 'rooms' => "Entrance | 8.51 sqm\nReception | 42.59 sqm\nStaircase 1 | 7.56 sqm\nMaid Toilet | 3.38 sqm\nMaster Bathroom 1 | 6.08 sqm\nMaster Dressing 2 | 6.13 sqm\nBedroom 1 | 17.14 sqm\nKitchen | 18.76 sqm\nTerrace 1 | 9.48 sqm\nMaster Dressing 1 | 7.01 sqm\nMaster Bedroom 2 | 15.23 sqm\nLobby | 7 sqm\nStaircase 2 | 7 sqm\nGuest Toilet | 4.56 sqm\nMaid Room | 4.39 sqm\nMaster Bedroom 1 | 16.56 sqm\nMaster Bathroom 2 | 5.12 sqm\nTerrace 2 | 8.69 sqm\nBathroom | 4.74 sqm\nServices | 50.20 sqm", 'beds' => 3, 'baths' => 3, 'floor' => ''],
        'A-246-C2-4' => ['layout' => '3 Bedrooms + 3 Bathrooms + Reception + Dressing + Kitchen + Terrace', 'rooms' => "Reception | 27.53 sqm\nCorridor | 6.08 sqm\nMaster Dressing | 3.18 sqm\nBedroom 2 | 15.44 sqm\nGuest Toilet | 3.64 sqm\nTerrace | 7.53 sqm\nMaster Bathroom | 5.48 sqm\nKitchen | 7.24 sqm\nMaster Bedroom | 14.47 sqm\nBedroom 1 | 15.21 sqm\nBathroom | 5.12 sqm", 'beds' => 3, 'baths' => 3, 'floor' => 'Second Floor'],
        'A-246-C3-4' => ['layout' => '3 Bedrooms + 3 Bathrooms + Reception + Dressing + Kitchen + Terrace', 'rooms' => "Reception | 28.38 sqm\nCorridor | 6.08 sqm\nMaster Dressing | 3.18 sqm\nBedroom 2 | 15.44 sqm\nGuest Toilet | 3.64 sqm\nTerrace | 7.53 sqm\nMaster Bathroom | 5.48 sqm\nKitchen | 7.24 sqm\nMaster Bedroom | 14.47 sqm\nBedroom 1 | 15.21 sqm\nBathroom | 5.12 sqm", 'beds' => 3, 'baths' => 3, 'floor' => 'Third Floor'],
        'B-247-A2-1' => ['layout' => '3 Bedrooms + 3 Bathrooms + Reception + Dressing + Kitchen + Terrace', 'rooms' => "Reception | 27.53 sqm\nCorridor | 6.08 sqm\nMaster Dressing | 3.18 sqm\nBedroom 2 | 15.44 sqm\nGuest Toilet | 3.64 sqm\nTerrace | 7.53 sqm\nMaster Bathroom | 5.48 sqm\nKitchen | 7.24 sqm\nMaster Bedroom | 14.47 sqm\nBedroom 1 | 15.21 sqm\nBathroom | 5.12 sqm", 'beds' => 3, 'baths' => 3, 'floor' => ''],
        'B-247-A3-1' => ['layout' => '3 Bedrooms + 3 Bathrooms + Reception + Dressing + Kitchen + Terrace', 'rooms' => "Reception | 27.53 sqm\nCorridor | 6.08 sqm\nMaster Dressing | 3.18 sqm\nBedroom 2 | 15.44 sqm\nGuest Toilet | 3.64 sqm\nTerrace | 7.53 sqm\nMaster Bathroom | 5.48 sqm\nKitchen | 7.24 sqm\nMaster Bedroom | 14.47 sqm\nBedroom 1 | 15.21 sqm\nBathroom | 5.12 sqm", 'beds' => 3, 'baths' => 3, 'floor' => 'Third Floor'],
        'R-IV-44-A2-1' => ['layout' => '3 Bedrooms + 3 Bathrooms + Entrance + Reception + Lobby + Dressing + Kitchen + Maid Room + Terrace', 'rooms' => "Entrance | 5.17 sqm\nReception | 35 sqm\nGuest Bathroom | 3.44 sqm\nMaster Dressing | 7.28 sqm\nBedroom 1 | 16.70 sqm\nLobby 1 | 1.56 sqm\nKitchen | 11.74 sqm\nMaster Bedroom 1 | 14.85 sqm\nBedroom 2 | 17.21 sqm\nLobby 2 | 8.50 sqm\nService & Utility | 39.50 sqm\nTerrace | 7.77 sqm\nMaid Room | 3.88 sqm\nMaid Bathroom | 3.24 sqm\nMaster Bathroom 1 | 5.74 sqm\nBathroom 1 | 8.6 sqm", 'beds' => 3, 'baths' => 3, 'floor' => 'Second Floor'],
        'R-TH-6-38-00-6' => ['layout' => '3 Bedrooms + Reception & Dining + Lobby + 4 Bathrooms + 2 Dressing + Kitchen + Maid Room + 3 Terrace + 3 Staircases', 'rooms' => "Porch | 6.16 sqm\nEntrance | 3.24 sqm\nReception | 60.37 sqm\nKitchen | 17.94 sqm\nBathroom 1 | 3.41 sqm\nBathroom 2 | 3.78 sqm\nRoof Terrace | 60.75 sqm\nStaircase 1 | 9 sqm\nMaster Bedroom 1 | 15.56 sqm\nBedroom 1 | 14.63 sqm\nBedroom 2 | 17 sqm\nMaster Dressing | 4.33 sqm\nMultipurpose Room | 6.88 sqm\nMaster Bathroom 1 | 6.24 sqm\nBathroom 1 | 5.33 sqm\nLobby | 8.57 sqm\nStaircase 1 | 9.18 sqm\nTerrace 1 | 1.7 sqm\nTerrace 2 | 3.78 sqm\nStaircase 2 | 11.2 sqm", 'beds' => 3, 'baths' => 4, 'floor' => ''],
        'F-IV-31-A2-2' => ['layout' => '2 Bedrooms + 2 Bathrooms + Reception + Lobby + Kitchen + Dressing + Terrace', 'rooms' => "Reception | 27.53 sqm\nBathroom | 4.5 sqm\nDressing | 2 sqm\nLobby | 6 sqm\nMaster Bathroom | 4.5 sqm\nBedroom 1 | 13 sqm\nKitchen | 9.5 sqm\nMaster Bedroom 1 | 14.45 sqm\nTerrace | 8 sqm", 'beds' => 2, 'baths' => 2, 'floor' => 'Second Floor'],
        'F-IV-31-B2-2' => ['layout' => '2 Bedrooms + 2 Bathrooms + Reception + Lobby + Kitchen + Dressing + Terrace', 'rooms' => "Reception | 27.53 sqm\nBathroom | 4.5 sqm\nDressing | 2 sqm\nLobby | 6 sqm\nMaster Bathroom | 4.5 sqm\nBedroom 1 | 13 sqm\nKitchen | 9.5 sqm\nMaster Bedroom 1 | 14.45 sqm\nTerrace | 8 sqm", 'beds' => 2, 'baths' => 2, 'floor' => 'Second Floor'],
        'LV-SM-TH-319-D' => ['layout' => '', 'rooms' => '', 'beds' => 3, 'baths' => 3, 'floor' => ''],
        'LV-SM-TH-326-D' => ['layout' => '', 'rooms' => '', 'beds' => 3, 'baths' => 3, 'floor' => ''],
        'LV-SM-TH-336-A' => ['layout' => '', 'rooms' => '', 'beds' => 3, 'baths' => 3, 'floor' => ''],
    ];
}

add_action('init', static function () {
    if (get_option('cheops_unit_rooms_v1') || !post_type_exists('cheops_unit')) return;
    update_option('cheops_unit_rooms_v1', 1, true);
    foreach (cheops_reference_unit_rooms() as $ref => $u) {
        $ids = get_posts(['post_type' => 'cheops_unit', 'post_status' => 'any', 'posts_per_page' => -1, 'fields' => 'ids', 'meta_key' => '_cheops_reference', 'meta_value' => $ref]);
        foreach ($ids as $id) {
            if ($u['layout'] !== '' && trim((string) get_post_meta($id, '_cheops_layout', true)) === '') update_post_meta($id, '_cheops_layout', $u['layout']);
            if ($u['rooms'] !== '' && trim((string) get_post_meta($id, '_cheops_rooms', true)) === '') update_post_meta($id, '_cheops_rooms', $u['rooms']);
            if ($u['beds'] && !(int) get_post_meta($id, '_cheops_beds', true)) update_post_meta($id, '_cheops_beds', (int) $u['beds']);
            if ($u['baths'] && !(int) get_post_meta($id, '_cheops_baths', true)) update_post_meta($id, '_cheops_baths', (int) $u['baths']);
            if ($u['floor'] !== '' && trim((string) get_post_meta($id, '_cheops_floor', true)) === '') update_post_meta($id, '_cheops_floor', $u['floor']);
        }
    }
    if (function_exists('cheops_bump_content_version')) cheops_bump_content_version();
}, 37);
