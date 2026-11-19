<?php
/**
 * Journal (blog), archives and search.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
get_header();

if ( is_search() ) {
	/* translators: %s: search query */
	$ph_title = sprintf( __( 'Results for “%s”', 'potteryhub' ), get_search_query() );
	$ph_eb    = __( 'Search', 'potteryhub' );
} elseif ( is_archive() ) {
	$ph_title = wp_strip_all_tags( get_the_archive_title() );
	$ph_eb    = __( 'Journal', 'potteryhub' );
} else {
	$ph_title = __( 'Journal', 'potteryhub' );
	$ph_eb    = __( 'Stories from the studio', 'potteryhub' );
}
?>
<div class="tpl tpl-journal">
	<div class="pband"></div>
	<div class="pwrap">
		<?php ph_page_hero( $ph_eb, $ph_title ); ?>
		<?php if ( have_posts() ) : ?>
			<div class="posts">
				<?php
				$ph_i = 0;
				while ( have_posts() ) :
					the_post();
					get_template_part( 'parts/post-card', null, array( 'i' => $ph_i++ ) );
				endwhile;
				?>
			</div>
			<div class="ph-pager"><?php the_posts_pagination( array( 'mid_size' => 1, 'prev_text' => ph_icon( 'back', 16, 2 ), 'next_text' => ph_icon( 'arrow', 16, 2 ) ) ); ?></div>
		<?php else : ?>
			<div class="dempty"><b><?php esc_html_e( 'Nothing found.', 'potteryhub' ); ?></b><br><a class="btn" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'potteryhub' ); ?></a></div>
		<?php endif; ?>
	</div>
</div>
<?php
get_footer();
