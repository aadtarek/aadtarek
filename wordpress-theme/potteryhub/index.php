<?php
/**
 * Fallback template (blog, archives, search).
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
get_header();
?>
<div class="std-page">
	<div class="pband"></div>
	<div class="pwrap">
		<h1 class="ptitle serif">
			<?php
			if ( is_search() ) {
				/* translators: %s: search query */
				printf( esc_html__( 'Results for “%s”', 'potteryhub' ), esc_html( get_search_query() ) );
			} elseif ( is_archive() ) {
				echo esc_html( wp_strip_all_tags( get_the_archive_title() ) );
			} else {
				esc_html_e( 'Journal', 'potteryhub' );
			}
			?>
		</h1>
		<?php if ( have_posts() ) : ?>
			<div class="posts">
				<?php
				while ( have_posts() ) :
					the_post();
					?>
					<article <?php post_class( 'post-item' ); ?>>
						<a href="<?php the_permalink(); ?>"><?php the_post_thumbnail( 'medium_large' ); ?></a>
						<h2 class="serif"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
						<div class="entry"><?php the_excerpt(); ?></div>
					</article>
				<?php endwhile; ?>
			</div>
			<?php the_posts_pagination(); ?>
		<?php else : ?>
			<p><?php esc_html_e( 'Nothing found.', 'potteryhub' ); ?></p>
		<?php endif; ?>
	</div>
</div>
<?php
get_footer();
