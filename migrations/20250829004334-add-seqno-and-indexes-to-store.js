'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('store');

    // 1) seq_no 컬럼 추가 (기존 데이터 대비 임시 default)
    if (!desc.seq_no) {
      await queryInterface.addColumn('store', 'seq_no', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    // 2) 유니크 인덱스
    const indexes = await queryInterface.showIndex('store');
    const hasUniq = indexes.some(i => i.name === 'uniq_store_seq_no');
    if (!hasUniq) {
      await queryInterface.addIndex('store', {
        fields: ['seq_no'],
        unique: true,
        name: 'uniq_store_seq_no',
      });
    }

    // 3) 보조 인덱스(선택)
    const hasNameIdx = indexes.some(i => i.name === 'idx_store_name');
    if (!hasNameIdx) {
      await queryInterface.addIndex('store', { fields: ['name'], name: 'idx_store_name' });
    }
    const hasRegionIdx = indexes.some(i => i.name === 'idx_store_region');
    if (!hasRegionIdx) {
      await queryInterface.addIndex('store', { fields: ['sido', 'sigungu'], name: 'idx_store_region' });
    }
  },

  async down(queryInterface) {
    try { await queryInterface.removeIndex('store', 'idx_store_region'); } catch {}
    try { await queryInterface.removeIndex('store', 'idx_store_name'); } catch {}
    try { await queryInterface.removeIndex('store', 'uniq_store_seq_no'); } catch {}
    try { await queryInterface.removeColumn('store', 'seq_no'); } catch {}
  }
};
